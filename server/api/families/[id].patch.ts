import { db } from '~~/server/utils/db'
import { eq } from 'drizzle-orm'
import { families } from '~~/db/schema'
import { updateFamilySchema } from '~~/schemas/family'

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event)
  const id = Number(getRouterParam(event, 'id'))
  const body = await readValidatedBody(event, updateFamilySchema.parseAsync)

  const family = await db.query.families.findFirst({
    where: (f, { eq }) => eq(f.familyId, id),
    with: { user: true },
  })

  if (!family) throw createError({ statusCode: 404, statusMessage: 'Семья не найдена' })
  if (family.ownerUserId !== user.userId) {
    throw createError({ statusCode: 403, statusMessage: 'Только владелец может редактировать семью' })
  }

  await db.update(families).set({ title: body.title }).where(eq(families.familyId, id))

  return {
    id: family.familyId,
    title: body.title,
    ownerName: family.user.name,
    createdAt: family.createdAt,
    isOwner: true,
  }
})
