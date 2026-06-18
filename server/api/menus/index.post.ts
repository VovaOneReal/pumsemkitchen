import { db } from '~~/server/utils/db'
import { menus } from '~~/db/schema'
import { menuFormSchema } from '~~/schemas/menu'
import { checkFamilyAccess } from '~~/server/utils/checkFamilyAccess'
import { z } from 'zod'

const createMenuSchema = menuFormSchema.extend({
  family_id: z.number().int().positive().optional().nullable(),
})

export default defineEventHandler(async (event) => {
  // Сессия гарантирована server/middleware/auth.ts
  const { user } = await getUserSession(event)
  const body = await readValidatedBody(event, createMenuSchema.parseAsync)
  const today = new Date().toISOString().slice(0, 10)

  if (body.family_id) await checkFamilyAccess(body.family_id, user.userId)

  const [created] = await db.insert(menus).values({
    userId: user.userId,
    familyId: body.family_id ?? null,
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
