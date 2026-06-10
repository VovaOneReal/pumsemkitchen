import { eq } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import { products } from '~~/db/schema'
import { updateProductSchema } from '~~/schemas/product'

export default defineEventHandler(async (event) => {
  // Сессия гарантирована server/middleware/auth.ts
  const { user } = await getUserSession(event)

  const id = Number(getRouterParam(event, 'id'))
  const body = await readValidatedBody(event, updateProductSchema.parseAsync)

  const existing = await db.query.products.findFirst({
    where: (p, { eq }) => eq(p.productId, id),
  })

  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Not found' })

  // Нормализация стоимости: привести к цене за одну единицу
  const normalizedPrice = Math.round((body.user_price / body.quantity_price) * 100) / 100
  const today = new Date().toISOString().slice(0, 10)

  await db.update(products).set({
    measurementUnitId: body.measurement_unit_id,
    title: body.title,
    userProteins: String(body.user_proteins),
    userFats: String(body.user_fats),
    userCarbs: String(body.user_carbs),
    userPrice: String(normalizedPrice),
    quantityPrice: '1',
    editedByUserId: user.userId,
    editedAt: today,
  }).where(eq(products.productId, id))

  const row = await db.query.products.findFirst({
    where: (p, { eq }) => eq(p.productId, id),
    with: { measurementUnit: true },
  })

  return {
    id: row!.productId,
    name: row!.title,
    image: null,
    priceRub: Number(row!.userPrice ?? row!.quantityPrice),
    priceQty: Number(row!.quantityPrice),
    priceUnit: row!.measurementUnit.unitName,
    protein: Number(row!.userProteins ?? 0),
    fat: Number(row!.userFats ?? 0),
    carbs: Number(row!.userCarbs ?? 0),
    calories: Number(row!.userCalories ?? 0),
  }
})
