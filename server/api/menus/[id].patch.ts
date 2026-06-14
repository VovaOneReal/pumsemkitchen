import { db } from '~~/server/utils/db'
import { menus, planDates } from '~~/db/schema'
import { eq } from 'drizzle-orm'
import { updateMenuSchema } from '~~/schemas/menu'

export default defineEventHandler(async (event) => {
  // Сессия гарантирована server/middleware/auth.ts
  const { user } = await getUserSession(event)
  const id = Number(getRouterParam(event, 'id'))
  const body = await readValidatedBody(event, updateMenuSchema.parseAsync)
  const today = new Date().toISOString().slice(0, 10)

  const existing = await db.query.menus.findFirst({
    where: (m, { eq }) => eq(m.menuId, id),
  })

  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Меню не найдено' })
  if (existing.userId !== user.userId) throw createError({ statusCode: 403, statusMessage: 'Нет доступа к меню' })

  await db.transaction(async (tx) => {
    await tx.update(menus).set({
      ...(body.title !== undefined && { menuTitle: body.title }),
      editUserId: user.userId,
      editedAt: today,
    }).where(eq(menus.menuId, id))

    // Обновляем период — удаляем старые даты и вставляем новые
    if (body.dateFrom !== undefined || body.dateTo !== undefined) {
      await tx.delete(planDates).where(eq(planDates.menuId, id))
      const from = body.dateFrom ?? existing.editedAt
      const to = body.dateTo ?? existing.editedAt
      await tx.insert(planDates).values([
        { menuId: id, planDate: from },
        { menuId: id, planDate: to },
      ])
    }
  })

  const row = await db.query.menus.findFirst({
    where: (m, { eq }) => eq(m.menuId, id),
    with: {
      user_userId: true,
      user_editUserId: true,
      planDates: true,
    },
  })

  const dates = (row!.planDates ?? []).map((pd) => pd.planDate).sort()
  return {
    id: row!.menuId,
    title: row!.menuTitle,
    authorName: row!.user_userId.name,
    createdAt: row!.createdAt,
    editedAt: row!.editedAt,
    editorName: row!.user_editUserId?.name ?? null,
    dateFrom: dates[0] ?? null,
    dateTo: dates[dates.length - 1] ?? null,
    estimatedCost: null,
  }
})
