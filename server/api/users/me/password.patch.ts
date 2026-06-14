import bcrypt from 'bcrypt'
import { eq } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import { users } from '~~/db/schema'
import { changePasswordSchema } from '~~/schemas/user'

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event)
  const { currentPassword, newPassword } = await readValidatedBody(event, changePasswordSchema.parseAsync)

  // Получаем актуальный хэш пароля из БД
  const [dbUser] = await db.select({ password: users.password }).from(users).where(eq(users.userId, user.userId)).limit(1)
  if (!dbUser) throw createError({ statusCode: 404, statusMessage: 'Пользователь не найден' })

  const passwordMatch = await bcrypt.compare(currentPassword, dbUser.password)
  if (!passwordMatch) throw createError({ statusCode: 400, statusMessage: 'Текущий пароль введён неверно' })

  const hashedPassword = await bcrypt.hash(newPassword, 10)
  await db.update(users).set({ password: hashedPassword }).where(eq(users.userId, user.userId))

  return { success: true }
})
