import { db } from '~~/server/utils/db'
import { families } from '~~/db/schema'
import { createFamilySchema } from '~~/schemas/family'

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event)
  const body = await readValidatedBody(event, createFamilySchema.parseAsync)

  const today = new Date().toISOString().slice(0, 10)
  const [created] = await db
    .insert(families)
    .values({ ownerUserId: user.userId, title: body.title, createdAt: today })
    .returning()

  return {
    id: created.familyId,
    title: created.title,
    ownerName: user.name,
    createdAt: created.createdAt,
    isOwner: true,
  }
})
