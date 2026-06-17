import { z } from 'zod'

export const updateMealRecipeSchema = z.object({
  portions: z
    .number({ error: 'Пожалуйста, заполните поле' })
    .int('Укажите целое число')
    .min(1, 'Минимум 1 порция'),
})

export type UpdateMealRecipeForm = z.infer<typeof updateMealRecipeSchema>
