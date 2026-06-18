import { db } from '~~/server/utils/db'
import { listElements } from '~~/db/schema'
import { eq } from 'drizzle-orm'
import { checkFamilyAccess } from '~~/server/utils/checkFamilyAccess'

export default defineEventHandler(async (event) => {
  // Сессия гарантирована server/middleware/auth.ts
  const { user } = await getUserSession(event)
  const listId = Number(getRouterParam(event, 'id'))
  const elementId = Number(getRouterParam(event, 'elementId'))

  const list = await db.query.shoppingLists.findFirst({
    where: (sl, { eq }) => eq(sl.shoppingListId, listId),
  })

  if (!list) throw createError({ statusCode: 404, statusMessage: 'Список не найден' })
  if (list.familyId) {
    await checkFamilyAccess(list.familyId, user.userId)
  } else if (list.userId !== user.userId) {
    throw createError({ statusCode: 403, statusMessage: 'Нет доступа к списку' })
  }

  const existing = await db.query.listElements.findFirst({
    where: (el, { eq }) => eq(el.elementId, elementId),
  })

  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Элемент не найден' })
  if (existing.shoppingListId !== listId) throw createError({ statusCode: 403, statusMessage: 'Элемент не принадлежит этому списку' })

  await db.delete(listElements).where(eq(listElements.elementId, elementId))

  return { message: 'Элемент удалён' }
})
