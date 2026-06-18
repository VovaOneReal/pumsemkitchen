import { z } from 'zod'

export const createShoppingListSchema = z.object({
  title: z.string().min(1, 'Название обязательно').max(128, 'Максимальная длина — 128 символов'),
  family_id: z.number().int().positive().optional().nullable(),
})

export const updateShoppingListSchema = z.object({
  title: z.string().min(1, 'Название обязательно').max(128, 'Максимальная длина — 128 символов'),
})

export type CreateShoppingListForm = z.infer<typeof createShoppingListSchema>
export type UpdateShoppingListForm = z.infer<typeof updateShoppingListSchema>
