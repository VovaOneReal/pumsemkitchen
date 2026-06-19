import { db } from '~~/server/utils/db'
import { checkFamilyAccess } from '~~/server/utils/checkFamilyAccess'

export default defineEventHandler(async (event) => {
  // Сессия гарантирована server/middleware/auth.ts
  const { user } = await getUserSession(event)

  const id = Number(getRouterParam(event, 'id'))

  const product = await db.query.products.findFirst({
    where: (p, { eq }) => eq(p.productId, id),
    with: { measurementUnitsRef: true, user_userId: true, user_editUserId: true },
  })

  if (!product) throw createError({ statusCode: 404, statusMessage: 'Not found' })

  if (product.familyId) {
    await checkFamilyAccess(product.familyId, user.userId)
  } else if (product.userId !== user.userId) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  return {
    id: product.productId,
    name: product.title,
    image: null,
    priceRub: Number(product.price ?? 0),
    priceQty: Number(product.quantityPerPrice ?? 0),
    priceUnit: product.measurementUnitsRef.unitAbbr,
    protein: Number(product.proteins ?? 0),
    fat: Number(product.fats ?? 0),
    carbs: Number(product.carbs ?? 0),
    calories: 0,
    isPublic: product.isPublic,
    isOwn: true,
    authorName: product.user_userId.name,
    createdAt: product.createdAt,
    modifierName: product.user_editUserId?.name ?? null,
    updatedAt: product.editedAt,
    gMeasure: product.gMeasure !== null ? Number(product.gMeasure) : null,
    mlMeasure: product.mlMeasure !== null ? Number(product.mlMeasure) : null,
    pcsMeasure: product.pcsMeasure !== null ? Number(product.pcsMeasure) : null,
    emissGoodsId: product.emissGoodsId ?? null,
  }
})
