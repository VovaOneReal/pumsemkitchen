import { db } from '~~/server/utils/db'
import { menus } from '~~/db/schema'
import { eq } from 'drizzle-orm'
import { checkFamilyAccess } from '~~/server/utils/checkFamilyAccess'

export default defineEventHandler(async (event) => {
  // Сессия гарантирована server/middleware/auth.ts
  const { user } = await getUserSession(event)
  const id = Number(getRouterParam(event, 'id'))

  const existing = await db.query.menus.findFirst({
    where: (m, { eq }) => eq(m.menuId, id),
  })

  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Меню не найдено' })
  if (existing.familyId) {
    await checkFamilyAccess(existing.familyId, user.userId)
  } else if (existing.userId !== user.userId) {
    throw createError({ statusCode: 403, statusMessage: 'Нет доступа к меню' })
  }

  await db.delete(menus).where(eq(menus.menuId, id))

  return { success: true }
})
