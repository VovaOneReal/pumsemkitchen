import { eq } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import { shoppingLists, listElements, shoppingListMenus, measurementUnitsRef, converts } from '~~/db/schema'
import { toGrams, type UnitRow } from '~~/server/utils/nutrition'

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event)
  const id = Number(getRouterParam(event, 'id'))

  const menu = await db.query.menus.findFirst({
    where: (m, { eq }) => eq(m.menuId, id),
    with: {
      planDates: {
        with: {
          meals: {
            with: {
              mealRecipes: {
                with: {
                  recipe: {
                    with: {
                      ingredients: { with: { product: true } },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  })

  if (!menu) throw createError({ statusCode: 404, statusMessage: 'Меню не найдено' })
  if (menu.userId !== user.userId) throw createError({ statusCode: 403, statusMessage: 'Нет доступа к меню' })

  const allUnits = await db.select().from(measurementUnitsRef)
  const allConverts = await db.select().from(converts)

  const stdGramUnit = allUnits.find(u => u.measureType === 'weight' && u.isStandart)
  const stdMlUnit = allUnits.find(u => u.measureType === 'volume' && u.isStandart)

  // Нестандартная весовая единица, конвертируемая в граммы (кг)
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

  // Сбор ингредиентов из всех дней, приёмов пищи и рецептов
  const groups = new Map<number, Array<{ qty: number; unitId: number; unit: UnitRow; product: typeof menu.planDates[0]['meals'][0]['mealRecipes'][0]['recipe']['ingredients'][0]['product']; name: string }>>()

  for (const planDate of menu.planDates) {
    for (const meal of planDate.meals) {
      for (const mr of meal.mealRecipes) {
        const recipe = mr.recipe
        const scaleFactor = mr.mealPortions / (recipe.portions || 1)

        for (const ing of recipe.ingredients) {
          if (ing.isOptional) continue

          // Не округляем здесь: несколько приёмов одного рецепта дадут накопленную ошибку
          const scaledQty = Number(ing.quantity) * scaleFactor
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
      }
    }
  }

  // Формирование элементов списка по аналогии с shopping-list рецепта
  const items: Array<{ title: string; quantity: number; measurementUnitId: number }> = []

  for (const entries of groups.values()) {
    if (!stdGramUnit) continue

    let totalGrams = 0
    let conversionFailed = false

    for (const e of entries) {
      const grams = toGrams(e.qty, e.unitId, e.product, allUnits, allConverts, stdGramUnit.measurementUnitId, stdMlUnit?.measurementUnitId ?? -1)
      if (grams === null) { conversionFailed = true; break }
      totalGrams += grams
    }

    if (conversionFailed) {
      if (entries.length === 1) {
        const e = entries[0]
        // Округляем здесь, так как это финальное значение для отображения
        items.push({ title: e.name, quantity: Math.round(e.qty * 10) / 10, measurementUnitId: e.unitId })
      }
      continue
    }

    totalGrams = Math.round(totalGrams * 10) / 10

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
  const listTitle = `Список: ${menu.menuTitle}`.slice(0, 128)

  // Idempotency: обновляем существующий список или создаём новый
  const existingLink = await db.query.shoppingListMenus.findFirst({
    where: (slm, { eq }) => eq(slm.menuId, id),
  })

  let shoppingListId: number
  let title: string

  if (existingLink) {
    shoppingListId = existingLink.shoppingListId
    await db.delete(listElements).where(eq(listElements.shoppingListId, shoppingListId))
    const [updated] = await db.update(shoppingLists)
      .set({ editedAt: today })
      .where(eq(shoppingLists.shoppingListId, shoppingListId))
      .returning()
    title = updated.title
  } else {
    const [created] = await db.insert(shoppingLists).values({
      userId: user.userId,
      title: listTitle,
      createdAt: today,
      editedAt: today,
    }).returning()
    shoppingListId = created.shoppingListId
    title = created.title
    await db.insert(shoppingListMenus).values({ menuId: id, shoppingListId })
  }

  if (items.length > 0) {
    await db.insert(listElements).values(
      items.map(item => ({
        shoppingListId,
        userId: user.userId,
        title: item.title,
        quantity: String(item.quantity),
        measurementUnitId: item.measurementUnitId,
        isChecked: false,
      })),
    )
  }

  return { id: shoppingListId, title }
})
