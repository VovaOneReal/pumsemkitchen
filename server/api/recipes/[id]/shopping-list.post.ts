import { z } from 'zod'
import { db } from '~~/server/utils/db'
import { shoppingLists, listElements, measurementUnitsRef, converts } from '~~/db/schema'
import { toGrams, type UnitRow } from '~~/server/utils/nutrition'
import { checkFamilyAccess } from '~~/server/utils/checkFamilyAccess'

const bodySchema = z.object({
  portions: z.number().int().min(1),
})

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
  if (recipe.familyId) {
    await checkFamilyAccess(recipe.familyId, user.userId)
  } else if (recipe.userId !== user.userId) {
    throw createError({ statusCode: 403, statusMessage: 'Нет доступа к рецепту' })
  }

  const allUnits = await db.select().from(measurementUnitsRef)
  const allConverts = await db.select().from(converts)

  const stdGramUnit = allUnits.find(u => u.measureType === 'weight' && u.isStandart)
  const stdMlUnit = allUnits.find(u => u.measureType === 'volume' && u.isStandart)

  // Единица «килограмм» — нестандартная весовая единица, связанная с граммами в любом направлении
  const kgUnit = stdGramUnit
    ? allUnits.find(u =>
        u.measureType === 'weight' &&
        !u.isStandart &&
        allConverts.some(
          c =>
            (c.fromUnitId === u.measurementUnitId && c.toUnitId === stdGramUnit.measurementUnitId) ||
            (c.fromUnitId === stdGramUnit.measurementUnitId && c.toUnitId === u.measurementUnitId),
        ),
      )
    : undefined

  const basePortions = recipe.portions || 1

  // Группировка ингредиентов по продукту
  const groups = new Map<number, Array<{ qty: number; unitId: number; unit: UnitRow; product: typeof recipe.ingredients[0]['product']; name: string }>>()

  for (const ing of recipe.ingredients) {
    // Ингредиенты "по вкусу" не добавляются в список покупок
    if (ing.isOptional) continue

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
    if (!stdGramUnit) continue

    // Суммируем все записи продукта в граммах
    let totalGrams = 0
    let conversionFailed = false

    for (const e of entries) {
      const grams = toGrams(e.qty, e.unitId, e.product, allUnits, allConverts, stdGramUnit.measurementUnitId, stdMlUnit?.measurementUnitId ?? -1)
      if (grams === null) { conversionFailed = true; break }
      totalGrams += grams
    }

    if (conversionFailed) {
      // Конвертация невозможна — оставляем оригинальную единицу (только для одиночных записей)
      if (entries.length === 1) {
        const e = entries[0]
        items.push({ title: e.name, quantity: e.qty, measurementUnitId: e.unitId })
      }
      continue
    }

    totalGrams = Math.round(totalGrams * 10) / 10

    // >= 500 г → килограммы
    if (totalGrams >= 500 && kgUnit) {
      items.push({
        title: entries[0].name,
        quantity: Math.round(totalGrams) / 1000,
        measurementUnitId: kgUnit.measurementUnitId,
      })
    } else {
      items.push({
        title: entries[0].name,
        quantity: totalGrams,
        measurementUnitId: stdGramUnit.measurementUnitId,
      })
    }
  }

  const today = new Date().toISOString().slice(0, 10)
  const title = `Список: ${recipe.title}`.slice(0, 128)

  const [created] = await db.insert(shoppingLists).values({
    userId: user.userId,
    familyId: recipe.familyId ?? null,
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
