import { db } from '~~/server/utils/db'
import { mealRecipes } from '~~/db/schema'
import { and, eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  // Сессия гарантирована server/middleware/auth.ts
  const { user } = await getUserSession(event)
  const mealId = Number(getRouterParam(event, 'mealId'))
  const recipeId = Number(getRouterParam(event, 'recipeId'))

  // Проверка владельца через цепочку meal → planDate → menu
  const meal = await db.query.meals.findFirst({
    where: (m, { eq }) => eq(m.mealId, mealId),
    with: { planDate: { with: { menu: true } } },
  })

  if (!meal) throw createError({ statusCode: 404, statusMessage: 'Приём пищи не найден' })
  if (meal.planDate.menu.userId !== user.userId) throw createError({ statusCode: 403, statusMessage: 'Нет доступа' })

  const deleted = await db
    .delete(mealRecipes)
    .where(and(eq(mealRecipes.mealId, mealId), eq(mealRecipes.recipeId, recipeId)))
    .returning()

  if (!deleted.length) throw createError({ statusCode: 404, statusMessage: 'Рецепт не найден в приёме пищи' })

  return { success: true }
})
