import { db } from '~~/server/utils/db'
import { shoppingLists } from '~~/db/schema'
import { createShoppingListSchema } from '~~/schemas/shopping-list'

// DD.MM.YYYY
const fmt = (d: string) => d.split('-').reverse().join('.')

export default defineEventHandler(async (event) => {
  // Сессия гарантирована server/middleware/auth.ts
  const { user } = await getUserSession(event)
  const body = await readValidatedBody(event, createShoppingListSchema.parseAsync)
  const today = new Date().toISOString().slice(0, 10)

  const [created] = await db.insert(shoppingLists).values({
    userId: user.userId,
    title: body.title,
    createdAt: today,
    editedAt: today,
  }).returning()

  const row = await db.query.shoppingLists.findFirst({
    where: (sl, { eq }) => eq(sl.shoppingListId, created.shoppingListId),
    with: {
      user_userId: true,
      user_editUserId: true,
    },
  })

  return {
    id: row!.shoppingListId,
    title: row!.title,
    authorName: row!.user_userId.name,
    createdAt: fmt(row!.createdAt),
    editorName: row!.user_editUserId?.name ?? null,
    editedAt: fmt(row!.editedAt),
  }
})
