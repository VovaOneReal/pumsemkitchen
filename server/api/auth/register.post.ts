import bcrypt from 'bcrypt'
import { eq } from 'drizzle-orm'
import { signupSchema } from '~~/schemas/auth'
import { db } from '~~/server/utils/db'
import { users } from '~~/db/schema'

export default defineEventHandler(async (event) => {
  const { login, password, inviteCode } = await readValidatedBody(event, signupSchema.parseAsync)

  // Проверка дубликата логина
  const existing = await db.select().from(users).where(eq(users.login, login)).limit(1)
  if (existing.length > 0) {
    throw createError({ statusCode: 409, statusMessage: 'Пользователь с таким логином уже существует' })
  }

  // Определение роли по пригласительному коду
  const role =
    inviteCode === process.env.INVITE_CODE_ADMIN ? 'admin'
    : inviteCode === process.env.INVITE_CODE ? 'user'
    : null
  if (!role) {
    throw createError({ statusCode: 400, statusMessage: 'Неверный пригласительный код' })
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  const today = new Date().toISOString().split('T')[0]

  const [user] = await db.insert(users).values({
    login,
    password: hashedPassword,
    name: login,
    createdAt: today,
    role,
  }).returning()

  await setUserSession(event, { user: { userId: user.userId, login: user.login, name: user.name, role: user.role } })

  return { userId: user.userId, login: user.login, name: user.name, role: user.role }
})
