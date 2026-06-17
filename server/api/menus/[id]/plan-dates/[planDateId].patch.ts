import { db } from '~~/server/utils/db'
import { planDates } from '~~/db/schema'
import { eq, and } from 'drizzle-orm'
import { planDateSchema } from '~~/schemas/planDate'

export default defineEventHandler(async (event) => {
  // Сессия гарантирована server/middleware/auth.ts
  const { user } = await getUserSession(event)
  const menuId = Number(getRouterParam(event, 'id'))
  const planDateId = Number(getRouterParam(event, 'planDateId'))
  const body = await readValidatedBody(event, planDateSchema.parseAsync)

  const menu = await db.query.menus.findFirst({
    where: (m, { eq }) => eq(m.menuId, menuId),
    with: { planDates: true },
  })

  if (!menu) throw createError({ statusCode: 404, statusMessage: 'Меню не найдено' })
  if (menu.userId !== user.userId) throw createError({ statusCode: 403, statusMessage: 'Нет доступа к меню' })

  const existing = menu.planDates.find((pd) => pd.planDateId === planDateId)
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'День не найден' })

  // Проверка дублирования с другими датами этого меню
  const duplicate = menu.planDates.some(
    (pd) => pd.planDate === body.planDate && pd.planDateId !== planDateId,
  )
  if (duplicate) throw createError({ statusCode: 409, statusMessage: 'Этот день уже добавлен в меню' })

  const [updated] = await db
    .update(planDates)
    .set({ planDate: body.planDate })
    .where(and(eq(planDates.planDateId, planDateId), eq(planDates.menuId, menuId)))
    .returning()

  return { planDateId: updated.planDateId, planDate: updated.planDate }
})
