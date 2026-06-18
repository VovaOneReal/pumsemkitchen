import { db } from '~~/server/utils/db'
import { eq, and } from 'drizzle-orm'
import { users, invitations, userAMemberOfFamilies } from '~~/db/schema'
import { inviteToFamilySchema } from '~~/schemas/family'

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event)
  const id = Number(getRouterParam(event, 'id'))
  const body = await readValidatedBody(event, inviteToFamilySchema.parseAsync)

  const family = await db.query.families.findFirst({
    where: (f, { eq }) => eq(f.familyId, id),
  })

  if (!family) throw createError({ statusCode: 404, statusMessage: 'Семья не найдена' })
  if (family.ownerUserId !== user.userId) {
    throw createError({ statusCode: 403, statusMessage: 'Только владелец может отправлять приглашения' })
  }

  // Нельзя пригласить самого себя
  if (body.login === user.login) {
    throw createError({ statusCode: 400, statusMessage: 'Нельзя пригласить самого себя' })
  }

  // Проверяем, существует ли пользователь с таким логином
  const invitedUser = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.login, body.login),
  })

  if (!invitedUser) throw createError({ statusCode: 404, statusMessage: 'Пользователь с таким логином не найден' })

  // Проверяем, не является ли уже участником или владельцем
  if (invitedUser.userId === family.ownerUserId) {
    throw createError({ statusCode: 400, statusMessage: 'Этот пользователь уже является владельцем семьи' })
  }

  const membership = await db.query.userAMemberOfFamilies.findFirst({
    where: (m, { eq, and }) => and(eq(m.familyId, id), eq(m.userId, invitedUser.userId)),
  })

  if (membership) throw createError({ statusCode: 400, statusMessage: 'Этот пользователь уже является участником семьи' })

  // Проверяем, нет ли активного неотвеченного приглашения
  const existingInvite = await db.query.invitations.findFirst({
    where: (inv, { eq, and }) =>
      and(eq(inv.familyId, id), eq(inv.userId, invitedUser.userId), eq(inv.status, 'sent')),
  })

  if (existingInvite) {
    throw createError({ statusCode: 400, statusMessage: 'Этому пользователю уже отправлено активное приглашение' })
  }

  const today = new Date().toISOString().slice(0, 10)
  await db.insert(invitations).values({
    familyId: id,
    userId: invitedUser.userId,
    status: 'sent',
    createdAt: today,
  })

  return { success: true }
})
