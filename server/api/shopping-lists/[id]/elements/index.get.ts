import { db } from '~~/server/utils/db'
import { checkFamilyAccess } from '~~/server/utils/checkFamilyAccess'

export default defineEventHandler(async (event) => {
  // Сессия гарантирована server/middleware/auth.ts
  const { user } = await getUserSession(event)
  const listId = Number(getRouterParam(event, 'id'))

  const list = await db.query.shoppingLists.findFirst({
    where: (sl, { eq }) => eq(sl.shoppingListId, listId),
  })

  if (!list) throw createError({ statusCode: 404, statusMessage: 'Список не найден' })
  if (list.familyId) {
    await checkFamilyAccess(list.familyId, user.userId)
  } else if (list.userId !== user.userId) {
    throw createError({ statusCode: 403, statusMessage: 'Нет доступа к списку' })
  }

  const rows = await db.query.listElements.findMany({
    where: (el, { eq }) => eq(el.shoppingListId, listId),
    with: { measurementUnitsRef: true, user: true },
    orderBy: (el, { desc }) => [desc(el.elementId)],
  })

  return rows.map((el) => ({
    id: el.elementId,
    title: el.title,
    quantity: Number(el.quantity),
    measurementUnitId: el.measurementUnitId,
    measurementUnitAbbr: el.measurementUnitsRef?.unitAbbr ?? null,
    isChecked: el.isChecked,
    authorName: el.user?.name ?? null,
  }))
})
