import { db } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event)
  const id = Number(getRouterParam(event, 'id'))

  const family = await db.query.families.findFirst({
    where: (f, { eq }) => eq(f.familyId, id),
    with: {
      user: true,
      userAMemberOfFamilies: { with: { user: true } },
    },
  })

  if (!family) throw createError({ statusCode: 404, statusMessage: 'Семья не найдена' })

  const isOwner = family.ownerUserId === user.userId
  const isMember = family.userAMemberOfFamilies.some((m) => m.userId === user.userId)

  if (!isOwner && !isMember) {
    throw createError({ statusCode: 403, statusMessage: 'Нет доступа к этой семье' })
  }

  // Владелец всегда первым в списке участников
  const members = [
    { userId: family.user.userId, name: family.user.name, login: family.user.login, isOwner: true },
    ...family.userAMemberOfFamilies.map((m) => ({
      userId: m.user.userId,
      name: m.user.name,
      login: m.user.login,
      isOwner: false,
    })),
  ]

  return {
    id: family.familyId,
    title: family.title,
    ownerName: family.user.name,
    createdAt: family.createdAt,
    isOwner,
    members,
  }
})
