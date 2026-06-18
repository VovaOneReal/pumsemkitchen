import { db } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event)

  const pending = await db.query.invitations.findMany({
    where: (inv, { eq, and }) => and(eq(inv.userId, user.userId), eq(inv.status, 'sent')),
    with: {
      family: { with: { user: true } },
    },
  })

  return pending.map((inv) => ({
    id: inv.inviteId,
    familyName: inv.family.title,
    ownerName: inv.family.user.name,
  }))
})
