import { db } from '~~/server/utils/db'

export default defineEventHandler(async () => {
  const rows = await db.query.products.findMany({
    where: (p, { eq }) => eq(p.isPublic, true),
    with: { measurementUnitsRef: true },
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
    priceFromProductId: p.priceFromProductId,
    nutritionsFromProductId: p.nutritionsFromProductId,
  }))
})
