import { db } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  // Сессия гарантирована server/middleware/auth.ts
  const { user } = await getUserSession(event)

  const rows = await db.query.menus.findMany({
    where: (m, { eq }) => eq(m.userId, user.userId),
    with: {
      user_userId: true,
      user_editUserId: true,
      planDates: true,
    },
    orderBy: (m, { desc }) => [desc(m.createdAt)],
  })

  return rows.map((m) => {
    const dates = m.planDates.map((pd) => pd.planDate).sort()
    return {
      id: m.menuId,
      title: m.menuTitle,
      authorName: m.user_userId.name,
      createdAt: m.createdAt,
      editedAt: m.editedAt,
      editorName: m.user_editUserId?.name ?? null,
      dateFrom: dates[0] ?? null,
      dateTo: dates[dates.length - 1] ?? null,
      estimatedCost: null,
    }
  })
})
