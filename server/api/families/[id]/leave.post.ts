import { db } from '~~/server/utils/db'
import { eq, and } from 'drizzle-orm'
import { families, userAMemberOfFamilies } from '~~/db/schema'

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event)
  const id = Number(getRouterParam(event, 'id'))

  const family = await db.query.families.findFirst({
    where: (f, { eq }) => eq(f.familyId, id),
  })

  if (!family) throw createError({ statusCode: 404, statusMessage: 'Семья не найдена' })

  const isOwner = family.ownerUserId === user.userId

  if (!isOwner) {
    // Проверяем, что пользователь является участником
    const membership = await db.query.userAMemberOfFamilies.findFirst({
      where: (m, { eq, and }) => and(eq(m.familyId, id), eq(m.userId, user.userId)),
    })
    if (!membership) throw createError({ statusCode: 403, statusMessage: 'Вы не являетесь участником этой семьи' })

    await db
      .delete(userAMemberOfFamilies)
      .where(and(eq(userAMemberOfFamilies.familyId, id), eq(userAMemberOfFamilies.userId, user.userId)))

    return { success: true }
  }

  // Владелец выходит: проверяем наличие других участников
  const members = await db
    .select()
    .from(userAMemberOfFamilies)
    .where(eq(userAMemberOfFamilies.familyId, id))

  if (members.length === 0) {
    // Единственный участник — удаляем семью
    await db.delete(families).where(eq(families.familyId, id))
    return { success: true, familyDeleted: true }
  }

  // Случайно выбираем нового владельца из участников
  const newOwner = members[Math.floor(Math.random() * members.length)]

  await db.transaction(async (tx) => {
    await tx.update(families).set({ ownerUserId: newOwner.userId }).where(eq(families.familyId, id))
    await tx
      .delete(userAMemberOfFamilies)
      .where(and(eq(userAMemberOfFamilies.familyId, id), eq(userAMemberOfFamilies.userId, newOwner.userId)))
  })

  return { success: true, familyDeleted: false }
})
