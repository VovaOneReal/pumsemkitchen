import { db } from '~~/server/utils/db'
import { eq } from 'drizzle-orm'
import { emissGoods } from '~~/db/schema'
import { emissGoodsPatchSchema } from '~~/schemas/emiss'

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event)

  if (user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Доступ запрещён' })
  }

  const body = await readValidatedBody(event, emissGoodsPatchSchema.parse)

  await Promise.all(
    body.goods.map((g) =>
      db
        .update(emissGoods)
        .set({ isShowingGoods: g.is_showing_goods })
        .where(eq(emissGoods.emissGoodsId, g.id)),
    ),
  )

  return { success: true }
})
