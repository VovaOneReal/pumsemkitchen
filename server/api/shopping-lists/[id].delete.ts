import { db } from '~~/server/utils/db'
import { shoppingLists } from '~~/db/schema'
import { eq } from 'drizzle-orm'
import { checkFamilyAccess } from '~~/server/utils/checkFamilyAccess'

export default defineEventHandler(async (event) => {
  // Сессия гарантирована server/middleware/auth.ts
  const { user } = await getUserSession(event)
  const id = Number(getRouterParam(event, 'id'))

  const existing = await db.query.shoppingLists.findFirst({
    where: (sl, { eq }) => eq(sl.shoppingListId, id),
  })

  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Список не найден' })
  if (existing.familyId) {
    await checkFamilyAccess(existing.familyId, user.userId)
  } else if (existing.userId !== user.userId) {
    throw createError({ statusCode: 403, statusMessage: 'Нет доступа к списку' })
  }

  await db.delete(shoppingLists).where(eq(shoppingLists.shoppingListId, id))

  return { message: 'Список удалён' }
})
