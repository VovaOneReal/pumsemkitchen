import { db } from '~~/server/utils/db'
import { checkFamilyAccess } from '~~/server/utils/checkFamilyAccess'

export default defineEventHandler(async (event) => {
  // Сессия гарантирована server/middleware/auth.ts
  const { user } = await getUserSession(event)
  const menuId = Number(getRouterParam(event, 'id'))

  const menu = await db.query.menus.findFirst({
    where: (m, { eq }) => eq(m.menuId, menuId),
    with: { planDates: { orderBy: (pd, { asc }) => [asc(pd.planDate)] } },
  })

  if (!menu) throw createError({ statusCode: 404, statusMessage: 'Меню не найдено' })
  if (menu.familyId) {
    await checkFamilyAccess(menu.familyId, user.userId)
  } else if (menu.userId !== user.userId) {
    throw createError({ statusCode: 403, statusMessage: 'Нет доступа к меню' })
  }

  return {
    menuTitle: menu.menuTitle,
    planDates: menu.planDates.map((pd) => ({ planDateId: pd.planDateId, planDate: pd.planDate })),
  }
})
