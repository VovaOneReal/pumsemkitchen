import { db } from '~~/server/utils/db'
import { eq } from 'drizzle-orm'
import { users } from '~~/db/schema'
import { updateUserSchema } from '~~/schemas/user'

export default defineEventHandler(async (event) => {
  // Сессия гарантирована server/middleware/auth.ts
  const { user } = await getUserSession(event)
  const body = await readValidatedBody(event, updateUserSchema.parseAsync)

  const [updated] = await db
    .update(users)
    .set({ name: body.name })
    .where(eq(users.userId, user.userId))
    .returning()

  if (!updated) throw createError({ statusCode: 404, statusMessage: 'Пользователь не найден' })

  return { login: updated.login, name: updated.name }
})
