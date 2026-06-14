import { db } from '~~/server/utils/db'
import { menus } from '~~/db/schema'
import { menuFormSchema } from '~~/schemas/menu'

export default defineEventHandler(async (event) => {
  // Сессия гарантирована server/middleware/auth.ts
  const { user } = await getUserSession(event)
  const body = await readValidatedBody(event, menuFormSchema.parseAsync)
  const today = new Date().toISOString().slice(0, 10)

  const [created] = await db.insert(menus).values({
    userId: user.userId,
    menuTitle: body.title,
    createdAt: today,
    editedAt: today,
  } as typeof menus.$inferInsert).returning()

  const row = await db.query.menus.findFirst({
    where: (m, { eq }) => eq(m.menuId, created.menuId),
    with: { user_userId: true, user_editUserId: true, planDates: true },
  })

  return {
    id: row!.menuId,
    title: row!.menuTitle,
    authorName: row!.user_userId.name,
    createdAt: row!.createdAt,
    editedAt: row!.editedAt,
    editorName: row!.user_editUserId?.name ?? null,
    dateFrom: null,
    dateTo: null,
    estimatedCost: null,
  }
})
