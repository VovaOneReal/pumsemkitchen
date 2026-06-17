import { db } from '~~/server/utils/db'
import { planDates } from '~~/db/schema'
import { and, eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  // Сессия гарантирована server/middleware/auth.ts
  const { user } = await getUserSession(event)
  const menuId = Number(getRouterParam(event, 'id'))
  const planDateId = Number(getRouterParam(event, 'planDateId'))

  const menu = await db.query.menus.findFirst({
    where: (m, { eq }) => eq(m.menuId, menuId),
  })

  if (!menu) throw createError({ statusCode: 404, statusMessage: 'Меню не найдено' })
  if (menu.userId !== user.userId) throw createError({ statusCode: 403, statusMessage: 'Нет доступа к меню' })

  const deleted = await db
    .delete(planDates)
    .where(and(eq(planDates.planDateId, planDateId), eq(planDates.menuId, menuId)))
    .returning()

  if (!deleted.length) throw createError({ statusCode: 404, statusMessage: 'День не найден' })

  return { success: true }
})
