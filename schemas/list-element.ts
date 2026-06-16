import { z } from 'zod'

export const createListElementSchema = z.object({
  title: z.string().min(1, 'Название обязательно').max(128, 'Максимальная длина — 128 символов'),
  quantity: z.coerce.number().min(0, 'Количество не может быть отрицательным'),
  measurementUnitId: z.number().int('Выберите единицу измерения'),
  isChecked: z.boolean().default(false),
})

export const updateListElementSchema = z.object({
  title: z.string().min(1).max(128).optional(),
  quantity: z.coerce.number().min(0).optional(),
  measurementUnitId: z.number().int().optional(),
  isChecked: z.boolean().optional(),
})

export type CreateListElementForm = z.infer<typeof createListElementSchema>
export type UpdateListElementForm = z.infer<typeof updateListElementSchema>
