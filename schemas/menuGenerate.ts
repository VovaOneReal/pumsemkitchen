import { z } from 'zod'

const MEAL_OPTIONS = ['Завтрак', 'Второй завтрак', 'Обед', 'Полдник', 'Ужин'] as const

// Преобразует строку или пустое значение в число (undefined = обязательное поле не заполнено)
const toNum = (v: unknown) => {
  if (v === '' || v === null || v === undefined) return undefined
  const n = Number(v)
  return Number.isNaN(n) ? undefined : n
}

// Преобразует строку или пустое значение в число или null (null = поле не указано, необязательное)
const toNumOrNull = (v: unknown) => {
  if (v === '' || v === null || v === undefined) return null
  const n = Number(v)
  return Number.isNaN(n) ? null : n
}

export const menuGenerateSchema = z
  .object({
    title: z
      .string({ error: 'Пожалуйста, заполните поле' })
      .min(1, 'Название не может быть пустым')
      .max(128, 'Не более 128 символов'),
    dateFrom: z
      .string({ error: 'Пожалуйста, заполните поле' })
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Неверный формат даты'),
    dateTo: z
      .string({ error: 'Пожалуйста, заполните поле' })
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Неверный формат даты'),
    numberOfPeople: z.preprocess(
      toNum,
      z
        .number({ error: 'Пожалуйста, заполните поле' })
        .int('Должно быть целым числом')
        .min(1, 'Минимум 1 человек'),
    ),
    targetCaloriesPerDay: z.preprocess(
      toNum,
      z
        .number({ error: 'Пожалуйста, заполните поле' })
        .int('Должно быть целым числом')
        .min(100, 'Минимум 100 ккал в день'),
    ),
    totalBudget: z.preprocess(
      toNumOrNull,
      z.number({ error: 'Введите корректное число' }).positive('Должно быть положительным числом').nullable(),
    ),
    selectedMeals: z
      .array(z.enum(MEAL_OPTIONS), { error: 'Пожалуйста, выберите приёмы пищи' })
      .min(1, 'Выберите хотя бы один приём пищи'),
    familyId: z.number().int().positive().optional().nullable(),
  })
  .refine(d => !d.dateFrom || !d.dateTo || d.dateFrom <= d.dateTo, {
    message: 'Дата начала не может быть позже даты окончания',
    path: ['dateTo'],
  })

export type MenuGenerateForm = z.infer<typeof menuGenerateSchema>
