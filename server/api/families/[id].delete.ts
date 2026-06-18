import { db } from '~~/server/utils/db'
import { eq } from 'drizzle-orm'
import { families } from '~~/db/schema'

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event)
  const id = Number(getRouterParam(event, 'id'))

  const family = await db.query.families.findFirst({
    where: (f, { eq }) => eq(f.familyId, id),
  })

  if (!family) throw createError({ statusCode: 404, statusMessage: 'Семья не найдена' })
  if (family.ownerUserId !== user.userId) {
    throw createError({ statusCode: 403, statusMessage: 'Только владелец может удалить семью' })
  }

  await db.delete(families).where(eq(families.familyId, id))

  return { success: true }
})
