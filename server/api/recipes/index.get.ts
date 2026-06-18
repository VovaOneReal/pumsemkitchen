import { db } from '~~/server/utils/db'
import { checkFamilyAccess } from '~~/server/utils/checkFamilyAccess'

export default defineEventHandler(async (event) => {
  // Сессия гарантирована server/middleware/auth.ts
  const { user } = await getUserSession(event)
  const { familyId: familyIdStr } = getQuery(event)
  const familyId = familyIdStr ? Number(familyIdStr) : null

  if (familyId) await checkFamilyAccess(familyId, user.userId)

  const rows = await db.query.recipes.findMany({
    where: (r, { eq, and, isNull }) =>
      familyId
        ? eq(r.familyId, familyId)
        : and(eq(r.userId, user.userId), isNull(r.familyId)),
    with: { user_userId: true },
    orderBy: (r, { desc }) => [desc(r.createdAt)],
  })

  return rows.map((r) => ({
    id: r.recipeId,
    title: r.title,
    description: r.description,
    cookingTimeMin: r.cookingTimeMin,
    portions: r.portions,
    isPublic: r.isPublic,
    pictureUrl: r.pictureUrl,
    sourceUrl: r.sourceUrl,
    createdAt: r.createdAt,
    editedAt: r.editedAt,
    authorName: r.user_userId.name,
  }))
})
