import { db } from '~~/server/utils/db'
import { eq, and } from 'drizzle-orm'
import { users, families, userAMemberOfFamilies } from '~~/db/schema'

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event)

  // Передаём права на семьи перед удалением профиля
  const ownedFamilies = await db.query.families.findMany({
    where: (f, { eq }) => eq(f.ownerUserId, user.userId),
  })

  for (const family of ownedFamilies) {
    const members = await db
      .select()
      .from(userAMemberOfFamilies)
      .where(eq(userAMemberOfFamilies.familyId, family.familyId))

    if (members.length > 0) {
      const newOwner = members[Math.floor(Math.random() * members.length)]
      await db.transaction(async (tx) => {
        await tx
          .update(families)
          .set({ ownerUserId: newOwner.userId })
          .where(eq(families.familyId, family.familyId))
        await tx
          .delete(userAMemberOfFamilies)
          .where(
            and(
              eq(userAMemberOfFamilies.familyId, family.familyId),
              eq(userAMemberOfFamilies.userId, newOwner.userId),
            ),
          )
      })
    }
    // Семьи без участников каскадно удалятся вместе с пользователем
  }

  await db.delete(users).where(eq(users.userId, user.userId))
  await clearUserSession(event)

  return { success: true }
})
