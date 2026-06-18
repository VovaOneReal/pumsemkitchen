import { db } from '~~/server/utils/db'
import { checkFamilyAccess } from '~~/server/utils/checkFamilyAccess'

// DD.MM.YYYY
const fmt = (d: string) => d.split('-').reverse().join('.')

export default defineEventHandler(async (event) => {
  // Сессия гарантирована server/middleware/auth.ts
  const { user } = await getUserSession(event)
  const { familyId: familyIdStr } = getQuery(event)
  const familyId = familyIdStr ? Number(familyIdStr) : null

  if (familyId) await checkFamilyAccess(familyId, user.userId)

  const rows = await db.query.shoppingLists.findMany({
    where: (sl, { eq, and, isNull }) =>
      familyId
        ? eq(sl.familyId, familyId)
        : and(eq(sl.userId, user.userId), isNull(sl.familyId)),
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
