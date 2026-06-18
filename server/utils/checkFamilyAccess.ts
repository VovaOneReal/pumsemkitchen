import { db } from '~~/server/utils/db'

// Выбрасывает 403, если пользователь не является членом или владельцем семьи
export async function checkFamilyAccess(familyId: number, userId: number) {
  const family = await db.query.families.findFirst({
    where: (f, { eq }) => eq(f.familyId, familyId),
    with: { userAMemberOfFamilies: true },
  })
  if (!family) throw createError({ statusCode: 404, statusMessage: 'Семья не найдена' })
  const isMember =
    family.ownerUserId === userId || family.userAMemberOfFamilies.some((m) => m.userId === userId)
  if (!isMember)
    throw createError({ statusCode: 403, statusMessage: 'Нет доступа к семейному пространству' })
}
