import { z } from 'zod'
import { db } from '~~/server/utils/db'
import { shoppingLists, listElements, measurementUnitsRef, converts } from '~~/db/schema'

const bodySchema = z.object({
  portions: z.number().int().min(1),
})

type ProductRow = {
  gMeasure: string | null
  mlMeasure: string | null
  pcsMeasure: string | null
}

type UnitRow = { measurementUnitId: number; measureType: string; isStandart: boolean }
type ConvertRow = { fromUnitId: number; toUnitId: number; convertationCoefficient: string }

// Конвертация количества в граммы — аналог unitToGrams из recipe.vue
function toGrams(
  qty: number,
  unitId: number,
  product: ProductRow,
  allUnits: UnitRow[],
  allConverts: ConvertRow[],
  stdGramUnitId: number,
  stdMlUnitId: number,
): number | null {
  const unit = allUnits.find(u => u.measurementUnitId === unitId)
  if (!unit) return null

  if (unit.measureType === 'weight') {
    if (unit.isStandart) return qty
    const conv = allConverts.find(c => c.fromUnitId === unitId && c.toUnitId === stdGramUnitId)
    return conv ? qty * Number(conv.convertationCoefficient) : null
  }

  if (unit.measureType === 'volume' || unit.measureType === 'volume_extra') {
    if (!product.mlMeasure || !product.gMeasure) return null
    let mlQty = qty
    if (unitId !== stdMlUnitId) {
      const conv = allConverts.find(c => c.fromUnitId === unitId && c.toUnitId === stdMlUnitId)
      if (!conv) return null
      mlQty = qty * Number(conv.convertationCoefficient)
    }
    return (mlQty / Number(product.mlMeasure)) * Number(product.gMeasure)
  }

  if (unit.measureType === 'piece') {
    if (!product.pcsMeasure || !product.gMeasure) return null
    return (qty / Number(product.pcsMeasure)) * Number(product.gMeasure)
  }

  return null
}

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event)
  const id = Number(getRouterParam(event, 'id'))
  const body = await readValidatedBody(event, bodySchema.parseAsync)

  const recipe = await db.query.recipes.findFirst({
    where: (r, { eq }) => eq(r.recipeId, id),
    with: {
      ingredients: {
        with: { product: true, measurementUnitsRef: true },
      },
    },
  })

  if (!recipe) throw createError({ statusCode: 404, statusMessage: 'Рецепт не найден' })
  if (recipe.userId !== user.userId) throw createError({ statusCode: 403, statusMessage: 'Нет доступа к рецепту' })

  const allUnits = await db.select().from(measurementUnitsRef)
  const allConverts = await db.select().from(converts)

  const stdGramUnit = allUnits.find(u => u.measureType === 'weight' && u.isStandart)
  const stdMlUnit = allUnits.find(u => u.measureType === 'volume' && u.isStandart)
  const basePortions = recipe.portions || 1

  // Группировка ингредиентов по продукту
  const groups = new Map<number, Array<{ qty: number; unitId: number; unit: UnitRow; product: ProductRow; name: string }>>()

  for (const ing of recipe.ingredients) {
    const scaledQty = Math.round(Number(ing.quantity) * (body.portions / basePortions) * 10) / 10
    const unit = allUnits.find(u => u.measurementUnitId === ing.measurementUnitId)
    if (!unit) continue

    const entry = {
      qty: scaledQty,
      unitId: ing.measurementUnitId,
      unit,
      product: ing.product,
      name: ing.product.title,
    }

    if (!groups.has(ing.productId)) groups.set(ing.productId, [])
    groups.get(ing.productId)!.push(entry)
  }

  // Формирование элементов списка
  const items: Array<{ title: string; quantity: number; measurementUnitId: number }> = []

  for (const entries of groups.values()) {
    if (entries.length === 1) {
      const e = entries[0]
      // volume_extra → конвертировать в мл
      if (e.unit.measureType === 'volume_extra' && stdMlUnit) {
        const conv = allConverts.find(c => c.fromUnitId === e.unitId && c.toUnitId === stdMlUnit.measurementUnitId)
        if (conv) {
          items.push({
            title: e.name,
            quantity: Math.round(e.qty * Number(conv.convertationCoefficient) * 10) / 10,
            measurementUnitId: stdMlUnit.measurementUnitId,
          })
          continue
        }
      }
      items.push({ title: e.name, quantity: e.qty, measurementUnitId: e.unitId })
    } else {
      // Несколько ингредиентов одного продукта → суммировать в граммах
      if (!stdGramUnit) continue
      let totalGrams = 0
      for (const e of entries) {
        const grams = toGrams(e.qty, e.unitId, e.product, allUnits, allConverts, stdGramUnit.measurementUnitId, stdMlUnit?.measurementUnitId ?? -1)
        if (grams !== null) totalGrams += grams
      }
      items.push({
        title: entries[0].name,
        quantity: Math.round(totalGrams * 10) / 10,
        measurementUnitId: stdGramUnit.measurementUnitId,
      })
    }
  }

  const today = new Date().toISOString().slice(0, 10)
  const title = `Список: ${recipe.title}`.slice(0, 128)

  const [created] = await db.insert(shoppingLists).values({
    userId: user.userId,
    title,
    createdAt: today,
    editedAt: today,
  }).returning()

  if (items.length > 0) {
    await db.insert(listElements).values(
      items.map(item => ({
        shoppingListId: created.shoppingListId,
        userId: user.userId,
        title: item.title,
        quantity: String(item.quantity),
        measurementUnitId: item.measurementUnitId,
        isChecked: false,
      })),
    )
  }

  return { id: created.shoppingListId, title: created.title }
})
