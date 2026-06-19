import { db } from '~~/server/utils/db'
import { checkFamilyAccess } from '~~/server/utils/checkFamilyAccess'

export default defineEventHandler(async (event) => {
  // Сессия гарантирована server/middleware/auth.ts
  const { user } = await getUserSession(event)
  const { familyId: familyIdStr } = getQuery(event)
  const familyId = familyIdStr ? Number(familyIdStr) : null

  if (familyId) await checkFamilyAccess(familyId, user.userId)

  const rows = await db.query.products.findMany({
    where: (p, { eq, and, isNull }) =>
      familyId
        ? eq(p.familyId, familyId)
        : and(eq(p.userId, user.userId), isNull(p.familyId)),
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
    emissGoodsId: p.emissGoodsId ?? null,
  }))
})
