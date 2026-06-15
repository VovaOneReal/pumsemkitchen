import { db } from '~~/server/utils/db'
import { converts } from '~~/db/schema'

export default defineEventHandler(async () => {
  const rows = await db.select().from(converts)

  return rows.map(r => ({
    fromUnitId: r.fromUnitId,
    toUnitId: r.toUnitId,
    coefficient: Number(r.convertationCoefficient),
  }))
})
