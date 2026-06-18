import { db } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event)

  // Семьи, где пользователь — владелец
  const ownedFamilies = await db.query.families.findMany({
    where: (f, { eq }) => eq(f.ownerUserId, user.userId),
    with: { user: true },
  })

  // Семьи, где пользователь — участник (через связующую таблицу)
  const memberLinks = await db.query.userAMemberOfFamilies.findMany({
    where: (m, { eq }) => eq(m.userId, user.userId),
    with: { family: { with: { user: true } } },
  })

  const owned = ownedFamilies.map((f) => ({
    id: f.familyId,
    title: f.title,
    ownerName: f.user.name,
    createdAt: f.createdAt,
    isOwner: true,
  }))

  const member = memberLinks.map((link) => ({
    id: link.family.familyId,
    title: link.family.title,
    ownerName: link.family.user.name,
    createdAt: link.family.createdAt,
    isOwner: false,
  }))

  return [...owned, ...member]
})
