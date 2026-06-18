import { z } from 'zod'

const ingredientSchema = z.object({
  product_id: z.number({ error: 'Выберите продукт' }).int().positive('Выберите продукт'),
  measurement_unit_id: z.number({ error: 'Выберите единицу измерения' }).int().positive('Выберите единицу измерения'),
  quantity: z.number({ error: 'Введите количество' }).min(0, 'Введите количество'),
  is_optional: z.boolean().optional(),
  note: z.string().max(128, 'Заметка не должна превышать 128 символов').optional(),
})

const stepSchema = z.object({
  order: z.number({ error: 'Укажите порядок шага' }).int().positive('Номер шага должен быть больше нуля'),
  description: z.string({ error: 'Заполните описание шага' }).min(1, 'Описание шага не может быть пустым'),
  picture_url: z.string().nullable().optional(),
})

export const createRecipeSchema = z.object({
  title: z.string({ error: 'Пожалуйста, заполните поле' })
    .min(1, 'Название не может быть пустым')
    .max(128, 'Название не должно превышать 128 символов'),
  description: z.string().nullable().optional(),
  cooking_time_min: z.number().int().positive('Время приготовления должно быть больше нуля').nullable().optional(),
  portions: z.number().int().min(0, 'Количество порций не может быть отрицательным').optional(),
  is_public: z.boolean().optional(),
  picture_url: z.string().nullable().optional(),
  source_url: z.string().url('Введите корректный URL').nullable().optional(),
  ingredients: z.array(ingredientSchema).optional(),
  steps: z.array(stepSchema).optional(),
})

export type CreateRecipeForm = z.infer<typeof createRecipeSchema>

export const updateRecipeSchema = createRecipeSchema.partial()
export type UpdateRecipeForm = z.infer<typeof updateRecipeSchema>
