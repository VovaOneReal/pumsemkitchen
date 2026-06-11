import { eq } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import { recipes } from '~~/db/schema'

export default defineEventHandler(async (event) => {
  // Сессия гарантирована server/middleware/auth.ts
  const { user } = await getUserSession(event)
  const id = Number(getRouterParam(event, 'id'))

  const existing = await db.query.recipes.findFirst({
    where: (r, { eq }) => eq(r.recipeId, id),
  })

  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Рецепт не найден' })
  if (existing.userId !== user.userId) throw createError({ statusCode: 403, statusMessage: 'Нет доступа к рецепту' })

  await db.delete(recipes).where(eq(recipes.recipeId, id))

  return { message: 'Рецепт успешно удалён' }
})
