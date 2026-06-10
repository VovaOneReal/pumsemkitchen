import bcrypt from 'bcrypt'
import { eq } from 'drizzle-orm'
import { loginSchema } from '~~/schemas/auth'
import { db } from '~~/server/utils/db'
import { users } from '~~/db/schema'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = await loginSchema.safeParseAsync(body)
  if (!parsed.success) {
    throw createError({ statusCode: 401, statusMessage: 'Неверный логин или пароль' })
  }
  const { login, password } = parsed.data

  const [user] = await db.select().from(users).where(eq(users.login, login)).limit(1)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Неверный логин или пароль' })
  }

  const passwordMatch = await bcrypt.compare(password, user.password)
  if (!passwordMatch) {
    throw createError({ statusCode: 401, statusMessage: 'Неверный логин или пароль' })
  }

  await setUserSession(event, {
    user: { userId: user.userId, login: user.login, name: user.name, role: user.role },
  })

  return { userId: user.userId, login: user.login, name: user.name, role: user.role }
})
