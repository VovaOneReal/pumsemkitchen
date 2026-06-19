import { db } from '~~/server/utils/db'
import { measurementUnitsRef, converts } from '~~/db/schema'
import { computeRecipeNutrition } from '~~/server/utils/nutrition'
import type { NutritionRefs, NutritionValues } from '~~/server/utils/nutrition'
import { checkFamilyAccess } from '~~/server/utils/checkFamilyAccess'

export default defineEventHandler(async (event) => {
  // Сессия гарантирована server/middleware/auth.ts
  const { user } = await getUserSession(event)
  const menuId = Number(getRouterParam(event, 'id'))

  // Шаг 1: структура меню без рецептов — избегаем коллизии псевдонимов Drizzle при глубине 8+ уровней
  const menu = await db.query.menus.findFirst({
    where: (m, { eq }) => eq(m.menuId, menuId),
    with: {
      planDates: {
        with: {
          meals: {
            with: { mealRecipes: true },
          },
        },
      },
    },
  })

  if (!menu) throw createError({ statusCode: 404, statusMessage: 'Меню не найдено' })
  if (menu.familyId) {
    await checkFamilyAccess(menu.familyId, user.userId)
  } else if (menu.userId !== user.userId) {
    throw createError({ statusCode: 403, statusMessage: 'Нет доступа к меню' })
  }

  // Шаг 2: уникальные ID рецептов из всего меню
  const recipeIds = [...new Set(
    menu.planDates.flatMap(pd =>
      pd.meals.flatMap(m => m.mealRecipes.map(mr => mr.recipeId)),
    ),
  )]

  // Шаг 3: рецепты с ингредиентами и ЕМИСС — отдельный запрос, глубина 5 уровней
  const recipes = recipeIds.length > 0
    ? await db.query.recipes.findMany({
        where: (r, { inArray }) => inArray(r.recipeId, recipeIds),
        with: {
          ingredients: {
            with: {
              product: {
                with: {
                  emissGood: {
                    with: { emissRecords: { orderBy: (r, { desc }) => desc(r.recordDate), limit: 1 } },
                  },
                },
              },
            },
          },
        },
      })
    : []

  const recipeMap = new Map(recipes.map(r => [r.recipeId, r]))

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
        const recipe = recipeMap.get(mr.recipeId)
        if (!recipe) continue
        const perPortion = computeRecipeNutrition(recipe.ingredients, recipe.portions, refs)
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
