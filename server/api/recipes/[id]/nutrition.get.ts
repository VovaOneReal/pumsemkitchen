import { db } from '~~/server/utils/db'
import { measurementUnitsRef, converts } from '~~/db/schema'
import { computeRecipeNutrition } from '~~/server/utils/nutrition'
import type { NutritionRefs } from '~~/server/utils/nutrition'
import { checkFamilyAccess } from '~~/server/utils/checkFamilyAccess'

export default defineEventHandler(async (event) => {
  // Сессия гарантирована server/middleware/auth.ts
  const { user } = await getUserSession(event)
  const id = Number(getRouterParam(event, 'id'))

  const recipe = await db.query.recipes.findFirst({
    where: (r, { eq }) => eq(r.recipeId, id),
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

  const refs: NutritionRefs = {
    allUnits,
    allConverts,
    stdGramUnitId: stdGramUnit?.measurementUnitId ?? -1,
    stdMlUnitId: stdMlUnit?.measurementUnitId ?? -1,
  }

  return computeRecipeNutrition(recipe.ingredients, recipe.portions, refs)
})
