import { z } from 'zod'

export const planDateSchema = z.object({
  planDate: z
    .string({ error: 'Пожалуйста, заполните поле' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Неверный формат даты'),
})

export type PlanDateForm = z.infer<typeof planDateSchema>
