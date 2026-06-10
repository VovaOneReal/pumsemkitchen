import { eq } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import { products } from '~~/db/schema'

export default defineEventHandler(async (event) => {
  // Сессия гарантирована server/middleware/auth.ts
  const { user } = await getUserSession(event)

  const id = Number(getRouterParam(event, 'id'))

  const existing = await db.query.products.findFirst({
    where: (p, { eq }) => eq(p.productId, id),
  })

  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Not found' })

  // Продукт принадлежит другому пользователю
  if (existing.userId !== user.userId) throw createError({ statusCode: 403, statusMessage: 'Forbidden' })

  try {
    await db.delete(products).where(eq(products.productId, id))
  } catch {
    // БД отказала из-за restrict на ингредиентах
    throw createError({
      statusCode: 409,
      statusMessage: 'Не получилось удалить продукт',
      message: 'Он уже используется. Сначала удалите его из всех рецептов, где он используется.',
    })
  }

  return { message: 'Продукт успешно удалён' }
})
