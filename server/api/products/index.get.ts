import { db } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  // Сессия гарантирована server/middleware/auth.ts
  const { user } = await getUserSession(event)

  const rows = await db.query.products.findMany({
    where: (p, { eq }) => eq(p.userId, user.userId),
    with: { measurementUnitsRef: true, user_userId: true, user_editUserId: true },
  })

  return rows.map((p) => ({
    id: p.productId,
    name: p.title,
    image: null,
    priceRub: Number(p.price ?? 0),
    priceQty: Number(p.quantityPerPrice ?? 0),
    priceUnit: p.measurementUnitsRef.unitAbbr,
    protein: Number(p.proteins ?? 0),
    fat: Number(p.fats ?? 0),
    carbs: Number(p.carbs ?? 0),
    calories: 0,
    isPublic: p.isPublic,
    isOwn: true,
    measurementUnitId: p.measurementUnitId,
    authorName: p.user_userId.name,
    createdAt: p.createdAt,
    modifierName: p.user_editUserId?.name ?? null,
    updatedAt: p.editedAt,
    gMeasure: p.gMeasure !== null ? Number(p.gMeasure) : null,
    mlMeasure: p.mlMeasure !== null ? Number(p.mlMeasure) : null,
    pcsMeasure: p.pcsMeasure !== null ? Number(p.pcsMeasure) : null,
  }))
})
