import { db } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  // Сессия гарантирована server/middleware/auth.ts
  const { user } = await getUserSession(event)

  const rows = await db.query.recipes.findMany({
    where: (r, { eq }) => eq(r.userId, user.userId),
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
