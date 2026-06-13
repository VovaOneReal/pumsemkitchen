import { db } from '~~/server/utils/db'
import { eq } from 'drizzle-orm'
import { users } from '~~/db/schema'

export default defineEventHandler(async (event) => {
  // Сессия гарантирована server/middleware/auth.ts
  const { user } = await getUserSession(event)

  await db.delete(users).where(eq(users.userId, user.userId))
  await clearUserSession(event)

  return { success: true }
})
