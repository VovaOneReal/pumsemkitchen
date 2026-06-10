import { z } from 'zod'

const requiredString = z.string({ error: 'Пожалуйста, заполните поле' })

export const loginSchema = z.object({
  login: requiredString
    .min(5, 'Логин должен содержать от 5 до 32 символов')
    .max(32, 'Логин должен содержать от 5 до 32 символов')
    .regex(/^[a-zA-Z0-9]+$/, 'Логин может содержать только латинские буквы и цифры'),
  password: requiredString
    .min(8, 'Пароль должен содержать не менее 8 символов')
    .max(1024, 'Пароль не должен превышать 1024 символа'),
})

export const signupSchema = loginSchema.extend({
  inviteCode: requiredString
    .min(1, 'Пожалуйста, заполните поле')
    .regex(/^[a-zA-Zа-яА-ЯёЁ0-9]+$/, 'Код может содержать только буквы и цифры'),
})

export type LoginForm = z.infer<typeof loginSchema>
export type SignupForm = z.infer<typeof signupSchema>
