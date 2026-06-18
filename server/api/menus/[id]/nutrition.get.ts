import { db } from '~~/server/utils/db'
import { measurementUnitsRef, converts } from '~~/db/schema'
import { computeRecipeNutrition } from '~~/server/utils/nutrition'
import type { NutritionRefs, NutritionValues } from '~~/server/utils/nutrition'

export default defineEventHandler(async (event) => {
  // Сессия гарантирована server/middleware/auth.ts
  const { user } = await getUserSession(event)
  const menuId = Number(getRouterParam(event, 'id'))

  // Загружаем всё меню с ингредиентами рецептов одним запросом
  const menu = await db.query.menus.findFirst({
    where: (m, { eq }) => eq(m.menuId, menuId),
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

  // Справочники грузятся один раз для расчёта всего меню
  const allUnits = await db.select().from(measurementUnitsRef)
  const allConverts = await db.select().from(converts)

  const stdGramUnit = allUnits.find(u => u.measureType === 'weight' && u.isStandart)
  const stdMlUnit = allUnits.find(u => u.measureType === 'volume' && u.isStandart)

  const refs: NutritionRefs = {
    allUnits,
    allConverts,
    stdGramUnitId: stdGramUnit?.measurementUnitId ?? -1,
    stdMlUnitId: stdMlUnit?.measurementUnitId ?? -1,
  }

  // Суммируем КБЖУ по всем дням → приёмам → рецептам
  const total: NutritionValues = { proteins: 0, fats: 0, carbs: 0, calories: 0, cost: 0 }

  for (const planDate of menu.planDates) {
    for (const meal of planDate.meals) {
      for (const mr of meal.mealRecipes) {
        const perPortion = computeRecipeNutrition(mr.recipe.ingredients, mr.recipe.portions, refs)
        const factor = mr.mealPortions
        total.proteins += perPortion.proteins * factor
        total.fats += perPortion.fats * factor
        total.carbs += perPortion.carbs * factor
        total.calories += perPortion.calories * factor
        total.cost += perPortion.cost * factor
      }
    }
  }

  return total
})
