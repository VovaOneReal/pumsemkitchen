import { db } from '~~/server/utils/db'
import { desc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event)

  if (user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Доступ запрещён' })
  }

  const rows = await db.query.emissGoods.findMany({
    with: {
      emissRecords: {
        orderBy: (r) => desc(r.recordDate),
        limit: 1,
      },
    },
  })

  return rows.map((g) => {
    const latest = g.emissRecords[0] ?? null
    return {
      id: g.emissGoodsId,
      name: g.emissGoodsName,
      isShowingGoods: g.isShowingGoods,
      latestPrice: latest ? Number(latest.recordPrice) : null,
      latestDate: latest ? latest.recordDate : null,
    }
  })
})
