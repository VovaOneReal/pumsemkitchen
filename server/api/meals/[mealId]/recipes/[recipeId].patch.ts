import { db } from '~~/server/utils/db'
import { mealRecipes } from '~~/db/schema'
import { and, eq } from 'drizzle-orm'
import { updateMealRecipeSchema } from '~~/schemas/mealRecipe'
import { checkFamilyAccess } from '~~/server/utils/checkFamilyAccess'

export default defineEventHandler(async (event) => {
  // Сессия гарантирована server/middleware/auth.ts
  const { user } = await getUserSession(event)
  const mealId = Number(getRouterParam(event, 'mealId'))
  const recipeId = Number(getRouterParam(event, 'recipeId'))
  const body = await readValidatedBody(event, updateMealRecipeSchema.parseAsync)

  // Проверка владельца через цепочку meal → planDate → menu
  const meal = await db.query.meals.findFirst({
    where: (m, { eq }) => eq(m.mealId, mealId),
    with: { planDate: { with: { menu: true } } },
  })

  if (!meal) throw createError({ statusCode: 404, statusMessage: 'Приём пищи не найден' })
  const menu = meal.planDate.menu
  if (menu.familyId) {
    await checkFamilyAccess(menu.familyId, user.userId)
  } else if (menu.userId !== user.userId) {
    throw createError({ statusCode: 403, statusMessage: 'Нет доступа' })
  }

  const [updated] = await db
    .update(mealRecipes)
    .set({ mealPortions: body.portions })
    .where(and(eq(mealRecipes.mealId, mealId), eq(mealRecipes.recipeId, recipeId)))
    .returning()

  if (!updated) throw createError({ statusCode: 404, statusMessage: 'Рецепт не найден в приёме пищи' })

  return { recipeId: updated.recipeId, mealId: updated.mealId, portions: updated.mealPortions }
})
