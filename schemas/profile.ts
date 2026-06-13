import { z } from 'zod'

const requiredString = z.string({ error: 'Пожалуйста, заполните поле' })

export const displayNameSchema = z.object({
  displayName: requiredString
    .min(1, 'Имя должно содержать от 1 до 32 символов')
    .max(32, 'Имя должно содержать от 1 до 32 символов')
    .regex(/^[^!@#$%^&*()+=[\]{};':"\\|,.<>/?`~]*$/, 'Имя не должно содержать спецсимволы, кроме «-»'),
})

export const changePasswordSchema = z.object({
  currentPassword: requiredString.min(1, 'Пожалуйста, заполните поле'),
  newPassword: requiredString
    .min(8, 'Пароль должен содержать не менее 8 символов')
    .max(1024, 'Пароль не должен превышать 1024 символа'),
  confirmPassword: requiredString
    .min(8, 'Пароль должен содержать не менее 8 символов')
    .max(1024, 'Пароль не должен превышать 1024 символа'),
})

export type DisplayNameForm = z.infer<typeof displayNameSchema>
export type ChangePasswordForm = z.infer<typeof changePasswordSchema>
