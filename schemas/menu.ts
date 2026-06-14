import { z } from 'zod'

export const menuFormSchema = z.object({
  title: z
    .string({ error: 'Пожалуйста, заполните поле' })
    .min(1, 'Название не может быть пустым')
    .max(128, 'Название не должно превышать 128 символов'),
})

export const updateMenuSchema = menuFormSchema.partial()

export type MenuForm = z.infer<typeof menuFormSchema>
export type UpdateMenuForm = z.infer<typeof updateMenuSchema>
