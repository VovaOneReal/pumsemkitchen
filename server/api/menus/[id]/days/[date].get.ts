import { db } from '~~/server/utils/db'
import { asc } from 'drizzle-orm'
import { meals, planDates } from '~~/db/schema'

export default defineEventHandler(async (event) => {
  // Сессия гарантирована server/middleware/auth.ts
  const { user } = await getUserSession(event)
  const menuId = Number(getRouterParam(event, 'id'))
  const date = getRouterParam(event, 'date')!

  const menu = await db.query.menus.findFirst({
    where: (m, { eq }) => eq(m.menuId, menuId),
    with: {
      planDates: {
        where: (pd, { eq }) => eq(pd.planDate, date),
        with: {
          meals: {
            orderBy: [asc(meals.mealOrder)],
            with: {
              mealRecipes: { with: { recipe: true } },
            },
          },
        },
      },
    },
  })

  if (!menu) throw createError({ statusCode: 404, statusMessage: 'Меню не найдено' })
  if (menu.userId !== user.userId) throw createError({ statusCode: 403, statusMessage: 'Нет доступа к меню' })

  const planDate = menu.planDates[0]
  if (!planDate) throw createError({ statusCode: 404, statusMessage: 'День не найден' })

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
      })),
    })),
  }
})
