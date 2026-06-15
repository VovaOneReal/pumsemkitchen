import { z } from 'zod'

const baseProductSchema = z.object({
  title: z.string({ error: 'Пожалуйста, заполните поле' })
    .min(1, 'Название не может быть пустым')
    .max(128, 'Название не должно превышать 128 символов'),
  proteins: z.number({ error: 'Введите число' }).min(0, 'Значение не может быть отрицательным'),
  fats: z.number({ error: 'Введите число' }).min(0, 'Значение не может быть отрицательным'),
  carbs: z.number({ error: 'Введите число' }).min(0, 'Значение не может быть отрицательным'),
  price: z.number({ error: 'Введите число' }).min(0, 'Значение не может быть отрицательным'),
  quantity_per_price: z.number({ error: 'Введите число' }).positive('Количество должно быть больше нуля'),
  measurement_unit_id: z.number({ error: 'Выберите единицу измерения' }).int().positive('Выберите единицу измерения'),
  family_id: z.number({ error: 'Укажите семью' }).int().positive('Укажите семью').optional(),
  g_measure: z.number({ error: 'Введите число' }).positive('Значение должно быть больше нуля').nullable().optional(),
  ml_measure: z.number({ error: 'Введите число' }).positive('Значение должно быть больше нуля').nullable().optional(),
  pcs_measure: z.number({ error: 'Введите число' }).positive('Значение должно быть больше нуля').nullable().optional(),
  is_public: z.boolean({ error: 'Укажите булевое значение' }).optional().default(false),
})

// Если указан ml или pcs — g обязателен
function refineMeasures(data: { g_measure?: number | null; ml_measure?: number | null; pcs_measure?: number | null }, ctx: z.RefinementCtx) {
  const hasAlt = data.ml_measure != null || data.pcs_measure != null
  if (hasAlt && data.g_measure == null) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Укажите граммы — они обязательны при наличии мл или штук',
      path: ['g_measure'],
    })
  }
}

export const createProductSchema = baseProductSchema.superRefine(refineMeasures)
export type CreateProductForm = z.infer<typeof createProductSchema>

export const updateProductSchema = createProductSchema
export type UpdateProductForm = z.infer<typeof updateProductSchema>

// Схема для клиентской формы: family_id исключён, т.к. сервер берёт его из сессии
export const productFormSchema = baseProductSchema.omit({ family_id: true }).superRefine(refineMeasures)
