import { db } from '~~/server/utils/db'
import { mealRecipes } from '~~/db/schema'
import { and, eq } from 'drizzle-orm'
import { addMealRecipeSchema } from '~~/schemas/mealRecipe'

export default defineEventHandler(async (event) => {
  // Сессия гарантирована server/middleware/auth.ts
  const { user } = await getUserSession(event)
  const mealId = Number(getRouterParam(event, 'mealId'))
  const body = await readValidatedBody(event, addMealRecipeSchema.parseAsync)

  // Проверка владельца через цепочку meal → planDate → menu
  const meal = await db.query.meals.findFirst({
    where: (m, { eq }) => eq(m.mealId, mealId),
    with: { planDate: { with: { menu: true } } },
  })

  if (!meal) throw createError({ statusCode: 404, statusMessage: 'Приём пищи не найден' })
  if (meal.planDate.menu.userId !== user.userId) throw createError({ statusCode: 403, statusMessage: 'Нет доступа' })

  // Проверка на дубликат
  const existing = await db.query.mealRecipes.findFirst({
    where: (mr, { and, eq }) => and(eq(mr.mealId, mealId), eq(mr.recipeId, body.recipeId)),
  })

  if (existing) throw createError({ statusCode: 409, statusMessage: 'Рецепт уже добавлен в приём пищи' })

  const [created] = await db
    .insert(mealRecipes)
    .values({ mealId, recipeId: body.recipeId, mealPortions: body.portions })
    .returning()

  return { recipeId: created.recipeId, mealId: created.mealId, portions: created.mealPortions }
})
