import { eq } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import { products, ingredients } from '~~/db/schema'
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

  // Запрещаем убирать ранее заданные меры, если продукт используется хотя бы в одном рецепте
  const isMeasureBeingNulled =
    (body.g_measure === null && existing.gMeasure !== null) ||
    (body.ml_measure === null && existing.mlMeasure !== null) ||
    (body.pcs_measure === null && existing.pcsMeasure !== null)
  if (isMeasureBeingNulled) {
    const usedInIngredient = await db.query.ingredients.findFirst({
      where: (i, { eq }) => eq(i.productId, id),
    })
    if (usedInIngredient) {
      throw createError({ statusCode: 422, statusMessage: 'Нельзя убирать меры продукта, используемого в рецептах' })
    }
  }

  const today = new Date().toISOString().slice(0, 10)

  await db.update(products).set({
    measurementUnitId: body.measurement_unit_id,
    familyId: body.family_id ?? null,
    title: body.title,
    proteins: String(body.proteins),
    fats: String(body.fats),
    carbs: String(body.carbs),
    price: String(body.price),
    quantityPerPrice: String(body.quantity_per_price),
    gMeasure: body.g_measure !== undefined ? (body.g_measure !== null ? String(body.g_measure) : null) : existing.gMeasure,
    mlMeasure: body.ml_measure !== undefined ? (body.ml_measure !== null ? String(body.ml_measure) : null) : existing.mlMeasure,
    pcsMeasure: body.pcs_measure !== undefined ? (body.pcs_measure !== null ? String(body.pcs_measure) : null) : existing.pcsMeasure,
    isPublic: body.is_public ?? false,
    editUserId: user.userId,
    editedAt: today,
  }).where(eq(products.productId, id))

  const row = await db.query.products.findFirst({
    where: (p, { eq }) => eq(p.productId, id),
    with: { measurementUnitsRef: true },
  })

  return {
    id: row!.productId,
    name: row!.title,
    image: null,
    priceRub: Number(row!.price ?? 0),
    priceQty: Number(row!.quantityPerPrice ?? 0),
    priceUnit: row!.measurementUnitsRef.unitAbbr,
    protein: Number(row!.proteins ?? 0),
    fat: Number(row!.fats ?? 0),
    carbs: Number(row!.carbs ?? 0),
    calories: 0,
    isPublic: row!.isPublic,
    isOwn: row!.userId === user.userId,
    measurementUnitId: row!.measurementUnitId,
    gMeasure: row!.gMeasure !== null ? Number(row!.gMeasure) : null,
    mlMeasure: row!.mlMeasure !== null ? Number(row!.mlMeasure) : null,
    pcsMeasure: row!.pcsMeasure !== null ? Number(row!.pcsMeasure) : null,
  }
})
