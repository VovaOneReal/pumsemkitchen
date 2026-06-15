import { db } from '~~/server/utils/db'
import { products } from '~~/db/schema'
import { createProductSchema } from '~~/schemas/product'

export default defineEventHandler(async (event) => {
  // Сессия гарантирована server/middleware/auth.ts
  const { user } = await getUserSession(event)

  const body = await readValidatedBody(event, createProductSchema.parseAsync)

  const today = new Date().toISOString().slice(0, 10)

  const [created] = await db.insert(products).values({
    userId: user.userId,
    familyId: body.family_id ?? null,
    measurementUnitId: body.measurement_unit_id,
    title: body.title,
    proteins: String(body.proteins),
    fats: String(body.fats),
    carbs: String(body.carbs),
    price: String(body.price),
    quantityPerPrice: String(body.quantity_per_price),
    gMeasure: body.g_measure != null ? String(body.g_measure) : null,
    mlMeasure: body.ml_measure != null ? String(body.ml_measure) : null,
    pcsMeasure: body.pcs_measure != null ? String(body.pcs_measure) : null,
    isPublic: body.is_public,
    createdAt: today,
    editedAt: today,
  }).returning()

  const row = await db.query.products.findFirst({
    where: (p, { eq }) => eq(p.productId, created.productId),
    with: { measurementUnitsRef: true, user_userId: true, user_editUserId: true },
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
    isOwn: true,
    measurementUnitId: row!.measurementUnitId,
    authorName: row!.user_userId.name,
    createdAt: row!.createdAt,
    modifierName: row!.user_editUserId?.name ?? null,
    updatedAt: row!.editedAt,
    gMeasure: row!.gMeasure !== null ? Number(row!.gMeasure) : null,
    mlMeasure: row!.mlMeasure !== null ? Number(row!.mlMeasure) : null,
    pcsMeasure: row!.pcsMeasure !== null ? Number(row!.pcsMeasure) : null,
  }
})
