import { db } from '~~/server/utils/db'
import { eq } from 'drizzle-orm'
import { shoppingLists } from '~~/db/schema'

// DD.MM.YYYY
const fmt = (d: string) => d.split('-').reverse().join('.')

export default defineEventHandler(async (event) => {
  // Сессия гарантирована server/middleware/auth.ts
  const { user } = await getUserSession(event)

  const rows = await db.query.shoppingLists.findMany({
    where: (sl, { eq }) => eq(sl.userId, user.userId),
    with: {
      user_userId: true,
      user_editUserId: true,
    },
    orderBy: (sl, { desc }) => [desc(sl.createdAt)],
  })

  return rows.map((sl) => ({
    id: sl.shoppingListId,
    title: sl.title,
    authorName: sl.user_userId.name,
    createdAt: fmt(sl.createdAt),
    editorName: sl.user_editUserId?.name ?? null,
    editedAt: fmt(sl.editedAt),
  }))
})
