import { db } from '~~/server/utils/db'
import { products } from '~~/db/schema'
import { createProductSchema } from '~~/schemas/product'

export default defineEventHandler(async (event) => {
  // Сессия гарантирована server/middleware/auth.ts
  const { user } = await getUserSession(event)

  const body = await readValidatedBody(event, createProductSchema.parseAsync)

  // Нормализация стоимости: привести к цене за одну единицу
  const normalizedPrice = Math.round((body.user_price / body.quantity_price) * 100) / 100
  const today = new Date().toISOString().slice(0, 10)

  const [created] = await db.insert(products).values({
    userId: user.userId,
    measurementUnitId: body.measurement_unit_id,
    title: body.title,
    userProteins: String(body.user_proteins),
    userFats: String(body.user_fats),
    userCarbs: String(body.user_carbs),
    userPrice: String(normalizedPrice),
    quantityPrice: '1',
    createdAt: today,
    editedAt: today,
  }).returning()

  const row = await db.query.products.findFirst({
    where: (p, { eq }) => eq(p.productId, created.productId),
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
