import { db } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  // Сессия гарантирована server/middleware/auth.ts
  const { user } = await getUserSession(event)

  const rows = await db.query.products.findMany({
    where: (p, { eq }) => eq(p.userId, user.userId),
    with: { measurementUnit: true },
  })

  return rows.map((p) => ({
    id: p.productId,
    name: p.title,
    image: null,
    priceRub: Number(p.userPrice ?? p.quantityPrice),
    priceQty: Number(p.quantityPrice),
    priceUnit: p.measurementUnit.unitName,
    protein: Number(p.userProteins ?? 0),
    fat: Number(p.userFats ?? 0),
    carbs: Number(p.userCarbs ?? 0),
    calories: Number(p.userCalories ?? 0),
  }))
})
