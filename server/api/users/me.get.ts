import { db } from '~~/server/utils/db'
import { eq } from 'drizzle-orm'
import { users } from '~~/db/schema'

export default defineEventHandler(async (event) => {
  // Сессия гарантирована server/middleware/auth.ts
  const { user } = await getUserSession(event)

  const row = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.userId, user.userId),
  })

  if (!row) throw createError({ statusCode: 404, statusMessage: 'Пользователь не найден' })

  return { login: row.login, name: row.name }
})
