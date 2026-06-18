import { db } from '~~/server/utils/db'
import { listElements } from '~~/db/schema'
import { createListElementSchema } from '~~/schemas/list-element'
import { checkFamilyAccess } from '~~/server/utils/checkFamilyAccess'

export default defineEventHandler(async (event) => {
  // Сессия гарантирована server/middleware/auth.ts
  const { user } = await getUserSession(event)
  const listId = Number(getRouterParam(event, 'id'))
  const body = await readValidatedBody(event, createListElementSchema.parseAsync)

  const list = await db.query.shoppingLists.findFirst({
    where: (sl, { eq }) => eq(sl.shoppingListId, listId),
  })

  if (!list) throw createError({ statusCode: 404, statusMessage: 'Список не найден' })
  if (list.familyId) {
    await checkFamilyAccess(list.familyId, user.userId)
  } else if (list.userId !== user.userId) {
    throw createError({ statusCode: 403, statusMessage: 'Нет доступа к списку' })
  }

  const [created] = await db.insert(listElements).values({
    shoppingListId: listId,
    userId: user.userId,
    title: body.title,
    quantity: String(body.quantity),
    measurementUnitId: body.measurementUnitId,
    isChecked: body.isChecked,
  }).returning()

  const row = await db.query.listElements.findFirst({
    where: (el, { eq }) => eq(el.elementId, created.elementId),
    with: { measurementUnitsRef: true, user: true },
  })

  return {
    id: row!.elementId,
    title: row!.title,
    quantity: Number(row!.quantity),
    measurementUnitId: row!.measurementUnitId,
    measurementUnitAbbr: row!.measurementUnitsRef?.unitAbbr ?? null,
    isChecked: row!.isChecked,
    authorName: row!.user?.name ?? null,
  }
})
