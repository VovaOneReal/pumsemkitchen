import { z } from 'zod'

export const createProductSchema = z.object({
  title: z.string({ error: 'Пожалуйста, заполните поле' })
    .min(1, 'Название не может быть пустым')
    .max(32, 'Название не должно превышать 32 символа'),
  user_proteins: z.number({ error: 'Введите число' }).min(0, 'Значение не может быть отрицательным'),
  user_fats: z.number({ error: 'Введите число' }).min(0, 'Значение не может быть отрицательным'),
  user_carbs: z.number({ error: 'Введите число' }).min(0, 'Значение не может быть отрицательным'),
  user_price: z.number({ error: 'Введите число' }).min(0, 'Значение не может быть отрицательным'),
  quantity_price: z.number({ error: 'Введите число' }).positive('Количество должно быть больше нуля'),
  measurement_unit_id: z.number({ error: 'Выберите единицу измерения' }).int().positive('Выберите единицу измерения'),
})

export type CreateProductForm = z.infer<typeof createProductSchema>

export const updateProductSchema = createProductSchema
export type UpdateProductForm = z.infer<typeof updateProductSchema>
