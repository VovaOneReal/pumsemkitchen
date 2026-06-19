import { z } from 'zod'
import { eq, and, gte, lte, inArray, isNull } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import { menus, measurementUnitsRef, converts, planDates } from '~~/db/schema'
import { computeRecipeNutrition, type NutritionRefs } from '~~/server/utils/nutrition'
import { checkFamilyAccess } from '~~/server/utils/checkFamilyAccess'

const querySchema = z.object({
  from:     z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Формат даты: YYYY-MM-DD'),
  to:       z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Формат даты: YYYY-MM-DD'),
  familyId: z.coerce.number().int().positive().optional(),
})

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event)
  const { from, to, familyId } = await getValidatedQuery(event, querySchema.parseAsync)

  if (familyId) await checkFamilyAccess(familyId, user.userId)

  // Получаем меню пространства
  const userMenus = await db.select({ menuId: menus.menuId })
    .from(menus)
    .where(
      familyId
        ? eq(menus.familyId, familyId)
        : and(eq(menus.userId, user.userId), isNull(menus.familyId)),
    )

  if (userMenus.length === 0) return []

  const menuIds = userMenus.map(m => m.menuId)

  // Загружаем все дни питания за указанный период
  const rows = await db.query.planDates.findMany({
    where: and(
      gte(planDates.planDate, from),
      lte(planDates.planDate, to),
      inArray(planDates.menuId, menuIds),
    ),
    with: {
      meals: {
        with: {
          mealRecipes: {
            with: {
              recipe: {
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
              },
            },
          },
        },
      },
    },
    orderBy: (pd, { asc }) => asc(pd.planDate),
  })

  if (rows.length === 0) return []

  // Справочники загружаем один раз для всех дней
  const allUnits    = await db.select().from(measurementUnitsRef)
  const allConverts = await db.select().from(converts)

  const stdGramUnit = allUnits.find(u => u.measureType === 'weight' && u.isStandart)
  const stdMlUnit   = allUnits.find(u => u.measureType === 'volume' && u.isStandart)

  const refs: NutritionRefs = {
    allUnits,
    allConverts,
    stdGramUnitId: stdGramUnit?.measurementUnitId ?? -1,
    stdMlUnitId:   stdMlUnit?.measurementUnitId   ?? -1,
  }

  // Агрегируем КБЖУ по каждому дню
  return rows.map((pd) => {
    let proteins = 0
    let fats     = 0
    let carbs    = 0
    let calories = 0
    let cost     = 0

    for (const meal of pd.meals) {
      for (const mr of meal.mealRecipes) {
        const perPortion = computeRecipeNutrition(mr.recipe.ingredients, mr.recipe.portions, refs)
        const factor = mr.mealPortions
        proteins += perPortion.proteins * factor
        fats     += perPortion.fats     * factor
        carbs    += perPortion.carbs    * factor
        calories += perPortion.calories * factor
        cost     += perPortion.cost     * factor
      }
    }

    return {
      date:     pd.planDate,
      proteins: Math.round(proteins * 10) / 10,
      fats:     Math.round(fats     * 10) / 10,
      carbs:    Math.round(carbs    * 10) / 10,
      calories: Math.round(calories * 10) / 10,
      cost:     Math.round(cost     * 100) / 100,
    }
  })
})
