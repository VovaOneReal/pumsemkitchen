import { db } from '~~/server/utils/db'
import { shoppingLists } from '~~/db/schema'
import { eq } from 'drizzle-orm'
import { updateShoppingListSchema } from '~~/schemas/shopping-list'

// DD.MM.YYYY
const fmt = (d: string) => d.split('-').reverse().join('.')

export default defineEventHandler(async (event) => {
  // Сессия гарантирована server/middleware/auth.ts
  const { user } = await getUserSession(event)
  const id = Number(getRouterParam(event, 'id'))
  const body = await readValidatedBody(event, updateShoppingListSchema.parseAsync)
  const today = new Date().toISOString().slice(0, 10)

  const existing = await db.query.shoppingLists.findFirst({
    where: (sl, { eq }) => eq(sl.shoppingListId, id),
  })

  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Список не найден' })
  if (existing.userId !== user.userId) throw createError({ statusCode: 403, statusMessage: 'Нет доступа к списку' })

  await db.update(shoppingLists)
    .set({ title: body.title, editedAt: today, editUserId: user.userId })
    .where(eq(shoppingLists.shoppingListId, id))

  const row = await db.query.shoppingLists.findFirst({
    where: (sl, { eq }) => eq(sl.shoppingListId, id),
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
