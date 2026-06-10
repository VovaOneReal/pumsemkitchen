import { db } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  // Сессия гарантирована server/middleware/auth.ts
  const { user } = await getUserSession(event)

  const id = Number(getRouterParam(event, 'id'))

  const product = await db.query.products.findFirst({
    where: (p, { eq }) => eq(p.productId, id),
    with: { measurementUnit: true },
  })

  if (!product) throw createError({ statusCode: 404, statusMessage: 'Not found' })

  // Продукт принадлежит другому пользователю
  if (product.userId !== user.userId) throw createError({ statusCode: 403, statusMessage: 'Forbidden' })

  return {
    id: product.productId,
    name: product.title,
    image: null,
    priceRub: Number(product.userPrice ?? product.quantityPrice),
    priceQty: Number(product.quantityPrice),
    priceUnit: product.measurementUnit.unitName,
    protein: Number(product.userProteins ?? 0),
    fat: Number(product.userFats ?? 0),
    carbs: Number(product.userCarbs ?? 0),
    calories: Number(product.userCalories ?? 0),
  }
})
