import { db } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  // Сессия гарантирована server/middleware/auth.ts
  const { user } = await getUserSession(event)

  const rows = await db.query.products.findMany({
    where: (p, { eq }) => eq(p.userId, user.userId),
    with: {
      measurementUnitsRef: true,
      productMeasuresInUnits: { with: { measurementUnitsRef: true } },
    },
  })

  return rows.map((p) => ({
    id: p.productId,
    name: p.title,
    image: null,
    priceRub: Number(p.userPrice ?? p.quantityPerPrice ?? 0),
    priceQty: Number(p.quantityPerPrice ?? 0),
    priceUnit: p.measurementUnitsRef.unitAbbr,
    protein: Number(p.proteins ?? 0),
    fat: Number(p.fats ?? 0),
    carbs: Number(p.carbs ?? 0),
    calories: 0,
    isPublic: p.isPublic,
    isOwn: true,
    measures: p.productMeasuresInUnits.map((m) => ({
      unitId: m.measurementUnitId,
      unitName: m.measurementUnitsRef.unitName,
      unitAbbr: m.measurementUnitsRef.unitAbbr,
      amount: m.productMeasureAmount !== null ? Number(m.productMeasureAmount) : null,
    })),
  }))
})
