import { db } from '~~/server/utils/db'

// DD.MM.YYYY
const fmt = (d: string) => d.split('-').reverse().join('.')

export default defineEventHandler(async (event) => {
  // Сессия гарантирована server/middleware/auth.ts
  const { user } = await getUserSession(event)
  const id = Number(getRouterParam(event, 'id'))

  const row = await db.query.shoppingLists.findFirst({
    where: (sl, { eq }) => eq(sl.shoppingListId, id),
    with: {
      user_userId: true,
      user_editUserId: true,
    },
  })

  if (!row) throw createError({ statusCode: 404, statusMessage: 'Список не найден' })
  if (row.userId !== user.userId) throw createError({ statusCode: 403, statusMessage: 'Нет доступа к списку' })

  return {
    id: row.shoppingListId,
    title: row.title,
    authorName: row.user_userId.name,
    createdAt: fmt(row.createdAt),
    editorName: row.user_editUserId?.name ?? null,
    editedAt: fmt(row.editedAt),
  }
})
