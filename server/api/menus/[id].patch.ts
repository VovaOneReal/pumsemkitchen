import { db } from '~~/server/utils/db'
import { menus } from '~~/db/schema'
import { eq } from 'drizzle-orm'
import { updateMenuSchema } from '~~/schemas/menu'
import { checkFamilyAccess } from '~~/server/utils/checkFamilyAccess'

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
  if (existing.familyId) {
    await checkFamilyAccess(existing.familyId, user.userId)
  } else if (existing.userId !== user.userId) {
    throw createError({ statusCode: 403, statusMessage: 'Нет доступа к меню' })
  }

  await db.update(menus).set({
    ...(body.title !== undefined && { menuTitle: body.title }),
    editUserId: user.userId,
    editedAt: today,
  }).where(eq(menus.menuId, id))

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
