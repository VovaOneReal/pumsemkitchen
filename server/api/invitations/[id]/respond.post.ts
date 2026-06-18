import { db } from '~~/server/utils/db'
import { eq } from 'drizzle-orm'
import { invitations, userAMemberOfFamilies } from '~~/db/schema'
import { respondInviteSchema } from '~~/schemas/family'

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event)
  const id = Number(getRouterParam(event, 'id'))
  const body = await readValidatedBody(event, respondInviteSchema.parseAsync)

  const invite = await db.query.invitations.findFirst({
    where: (inv, { eq }) => eq(inv.inviteId, id),
  })

  if (!invite) throw createError({ statusCode: 404, statusMessage: 'Приглашение не найдено' })
  if (invite.userId !== user.userId) {
    throw createError({ statusCode: 403, statusMessage: 'Это приглашение предназначено другому пользователю' })
  }
  if (invite.status !== 'sent') {
    throw createError({ statusCode: 400, statusMessage: 'Это приглашение уже было обработано' })
  }

  if (body.accept) {
    await db.transaction(async (tx) => {
      await tx.update(invitations).set({ status: 'accepted' }).where(eq(invitations.inviteId, id))
      await tx.insert(userAMemberOfFamilies).values({ familyId: invite.familyId, userId: user.userId })
    })
  } else {
    await db.update(invitations).set({ status: 'denied' }).where(eq(invitations.inviteId, id))
  }

  return { success: true }
})
