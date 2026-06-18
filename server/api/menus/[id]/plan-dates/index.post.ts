import { db } from '~~/server/utils/db'
import { planDates, meals } from '~~/db/schema'
import { planDateSchema } from '~~/schemas/planDate'
import { checkFamilyAccess } from '~~/server/utils/checkFamilyAccess'

const DEFAULT_MEALS = ['Завтрак', 'Второй завтрак', 'Обед', 'Полдник', 'Ужин']

export default defineEventHandler(async (event) => {
  // Сессия гарантирована server/middleware/auth.ts
  const { user } = await getUserSession(event)
  const menuId = Number(getRouterParam(event, 'id'))
  const body = await readValidatedBody(event, planDateSchema.parseAsync)

  const menu = await db.query.menus.findFirst({
    where: (m, { eq }) => eq(m.menuId, menuId),
    with: { planDates: true },
  })

  if (!menu) throw createError({ statusCode: 404, statusMessage: 'Меню не найдено' })
  if (menu.familyId) {
    await checkFamilyAccess(menu.familyId, user.userId)
  } else if (menu.userId !== user.userId) {
    throw createError({ statusCode: 403, statusMessage: 'Нет доступа к меню' })
  }

  // Проверка дублирования даты внутри меню
  const duplicate = menu.planDates.some((pd) => pd.planDate === body.planDate)
  if (duplicate) throw createError({ statusCode: 409, statusMessage: 'Этот день уже добавлен в меню' })

  const [created] = await db.insert(planDates).values({
    menuId,
    planDate: body.planDate,
  }).returning()

  // Автоматически создаём стандартные приёмы пищи
  await db.insert(meals).values(
    DEFAULT_MEALS.map((title, i) => ({
      planDateId: created.planDateId,
      mealTitle: title,
      mealOrder: i + 1,
    })),
  )

  return { planDateId: created.planDateId, planDate: created.planDate }
})
