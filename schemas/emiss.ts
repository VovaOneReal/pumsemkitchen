import { z } from 'zod'

export const emissGoodsPatchSchema = z.object({
  goods: z
    .array(
      z.object({
        id: z.number().int().positive(),
        is_showing_goods: z.boolean(),
      }),
    )
    .min(1, 'Необходимо передать хотя бы один товар'),
})
