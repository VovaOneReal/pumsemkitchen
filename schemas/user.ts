import { z } from 'zod'

export const updateUserSchema = z.object({
  name: z
    .string({ error: 'Пожалуйста, заполните поле' })
    .min(1, 'Имя не может быть пустым')
    .max(32, 'Имя не должно превышать 32 символа')
    .regex(/^[^!@#$%^&*()+=[\]{};':"\\|,.<>/?`~]*$/, 'Имя не должно содержать спецсимволы, кроме «-»'),
})

export type UpdateUserForm = z.infer<typeof updateUserSchema>
