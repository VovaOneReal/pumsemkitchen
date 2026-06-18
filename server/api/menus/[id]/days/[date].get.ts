import { db } from '~~/server/utils/db'
import { asc } from 'drizzle-orm'
import { meals, measurementUnitsRef, converts } from '~~/db/schema'
import { computeRecipeNutrition } from '~~/server/utils/nutrition'
import type { NutritionRefs } from '~~/server/utils/nutrition'
import { checkFamilyAccess } from '~~/server/utils/checkFamilyAccess'

export default defineEventHandler(async (event) => {
  // Сессия гарантирована server/middleware/auth.ts
  const { user } = await getUserSession(event)
  const menuId = Number(getRouterParam(event, 'id'))
  const date = getRouterParam(event, 'date')!

  // Загружаем меню с ингредиентами рецептов для расчёта КБЖУ
  const menu = await db.query.menus.findFirst({
    where: (m, { eq }) => eq(m.menuId, menuId),
    with: {
      planDates: {
        where: (pd, { eq }) => eq(pd.planDate, date),
        with: {
          meals: {
            orderBy: [asc(meals.mealOrder)],
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
  if (menu.familyId) {
    await checkFamilyAccess(menu.familyId, user.userId)
  } else if (menu.userId !== user.userId) {
    throw createError({ statusCode: 403, statusMessage: 'Нет доступа к меню' })
  }

  const planDate = menu.planDates[0]
  if (!planDate) throw createError({ statusCode: 404, statusMessage: 'День не найден' })

  // Справочники грузятся один раз для расчёта всех рецептов дня
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

  return {
    menuTitle: menu.menuTitle,
    planDate: planDate.planDate,
    meals: planDate.meals.map((m) => ({
      mealId: m.mealId,
      mealTitle: m.mealTitle,
      mealOrder: m.mealOrder,
      recipes: m.mealRecipes.map((mr) => ({
        recipeId: mr.recipeId,
        title: mr.recipe.title,
        portions: mr.mealPortions,
        cookingTimeMin: mr.recipe.cookingTimeMin,
        pictureUrl: mr.recipe.pictureUrl,
        nutritionPerPortion: computeRecipeNutrition(
          mr.recipe.ingredients,
          mr.recipe.portions,
          refs,
        ),
      })),
    })),
  }
})
