import { db } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  // Сессия гарантирована server/middleware/auth.ts
  const { user } = await getUserSession(event)

  const id = Number(getRouterParam(event, 'id'))

  const product = await db.query.products.findFirst({
    where: (p, { eq }) => eq(p.productId, id),
    with: {
      measurementUnitsRef: true,
      productMeasuresInUnits: { with: { measurementUnitsRef: true } },
    },
  })

  if (!product) throw createError({ statusCode: 404, statusMessage: 'Not found' })

  // Продукт принадлежит другому пользователю
  if (product.userId !== user.userId) throw createError({ statusCode: 403, statusMessage: 'Forbidden' })

  return {
    id: product.productId,
    name: product.title,
    image: null,
    priceRub: Number(product.userPrice ?? product.quantityPerPrice ?? 0),
    priceQty: Number(product.quantityPerPrice ?? 0),
    priceUnit: product.measurementUnitsRef.unitAbbr,
    protein: Number(product.proteins ?? 0),
    fat: Number(product.fats ?? 0),
    carbs: Number(product.carbs ?? 0),
    calories: 0,
    isPublic: product.isPublic,
    isOwn: true,
    measures: product.productMeasuresInUnits.map((m) => ({
      unitId: m.measurementUnitId,
      unitName: m.measurementUnitsRef.unitName,
      unitAbbr: m.measurementUnitsRef.unitAbbr,
      amount: m.productMeasureAmount !== null ? Number(m.productMeasureAmount) : null,
    })),
  }
})
