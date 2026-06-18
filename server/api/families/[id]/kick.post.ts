import { db } from '~~/server/utils/db'
import { eq, and } from 'drizzle-orm'
import { userAMemberOfFamilies } from '~~/db/schema'
import { kickMemberSchema } from '~~/schemas/family'

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event)
  const id = Number(getRouterParam(event, 'id'))
  const body = await readValidatedBody(event, kickMemberSchema.parseAsync)

  const family = await db.query.families.findFirst({
    where: (f, { eq }) => eq(f.familyId, id),
  })

  if (!family) throw createError({ statusCode: 404, statusMessage: 'Семья не найдена' })
  if (family.ownerUserId !== user.userId) {
    throw createError({ statusCode: 403, statusMessage: 'Только владелец может исключать участников' })
  }
  if (body.userId === user.userId) {
    throw createError({ statusCode: 400, statusMessage: 'Нельзя исключить самого себя' })
  }

  const membership = await db.query.userAMemberOfFamilies.findFirst({
    where: (m, { eq, and }) => and(eq(m.familyId, id), eq(m.userId, body.userId)),
  })

  if (!membership) throw createError({ statusCode: 404, statusMessage: 'Участник не найден в этой семье' })

  await db
    .delete(userAMemberOfFamilies)
    .where(and(eq(userAMemberOfFamilies.familyId, id), eq(userAMemberOfFamilies.userId, body.userId)))

  return { success: true }
})
