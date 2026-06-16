import { db } from '~~/server/utils/db'
import { listElements } from '~~/db/schema'
import { eq } from 'drizzle-orm'
import { updateListElementSchema } from '~~/schemas/list-element'

export default defineEventHandler(async (event) => {
  // Сессия гарантирована server/middleware/auth.ts
  const { user } = await getUserSession(event)
  const listId = Number(getRouterParam(event, 'id'))
  const elementId = Number(getRouterParam(event, 'elementId'))
  const body = await readValidatedBody(event, updateListElementSchema.parseAsync)

  const list = await db.query.shoppingLists.findFirst({
    where: (sl, { eq }) => eq(sl.shoppingListId, listId),
  })

  if (!list) throw createError({ statusCode: 404, statusMessage: 'Список не найден' })
  if (list.userId !== user.userId) throw createError({ statusCode: 403, statusMessage: 'Нет доступа к списку' })

  const existing = await db.query.listElements.findFirst({
    where: (el, { eq }) => eq(el.elementId, elementId),
  })

  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Элемент не найден' })
  if (existing.shoppingListId !== listId) throw createError({ statusCode: 403, statusMessage: 'Элемент не принадлежит этому списку' })

  await db.update(listElements).set({
    ...(body.title !== undefined && { title: body.title }),
    ...(body.quantity !== undefined && { quantity: String(body.quantity) }),
    ...(body.measurementUnitId !== undefined && { measurementUnitId: body.measurementUnitId }),
    ...(body.isChecked !== undefined && { isChecked: body.isChecked }),
  }).where(eq(listElements.elementId, elementId))

  const row = await db.query.listElements.findFirst({
    where: (el, { eq }) => eq(el.elementId, elementId),
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
