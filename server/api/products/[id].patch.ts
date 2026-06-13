import { eq, inArray, sql } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import { products, productMeasuresInUnits, measurementUnitsRef } from '~~/db/schema'
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

  const today = new Date().toISOString().slice(0, 10)

  await db.update(products).set({
    measurementUnitId: body.measurement_unit_id,
    familyId: body.family_id ?? null,
    title: body.title,
    proteins: String(body.proteins),
    fats: String(body.fats),
    carbs: String(body.carbs),
    userPrice: String(body.user_price),
    quantityPerPrice: String(body.quantity_per_price),
    isPublic: body.is_public ?? false,
    editUserId: user.userId,
    editedAt: today,
  }).where(eq(products.productId, id))

  // Обновление пропорций в единицах измерения
  const measureFields = [
    { key: 'граммы', value: body.g_measure },
    { key: 'миллилитры', value: body.ml_measure },
    { key: 'штуки', value: body.pcs_measure },
  ].filter((m) => m.value != null) as { key: string; value: number }[]

  if (measureFields.length > 0) {
    const unitNames = measureFields.map((m) => m.key)

    const units = await db
      .select({ measurementUnitId: measurementUnitsRef.measurementUnitId, unitName: measurementUnitsRef.unitName })
      .from(measurementUnitsRef)
      .where(inArray(measurementUnitsRef.unitName, unitNames))

    const unitMap = new Map(units.map((u) => [u.unitName, u.measurementUnitId]))

    const measuresToUpsert = measureFields
      .map((m) => ({ unitId: unitMap.get(m.key), amount: m.value }))
      .filter((m): m is { unitId: number; amount: number } => m.unitId != null)

    if (measuresToUpsert.length > 0) {
      await db.insert(productMeasuresInUnits)
        .values(measuresToUpsert.map((m) => ({
          productId: id,
          measurementUnitId: m.unitId,
          productMeasureAmount: String(m.amount),
        })))
        .onConflictDoUpdate({
          target: [productMeasuresInUnits.productId, productMeasuresInUnits.measurementUnitId],
          set: { productMeasureAmount: sql`excluded.product_measure_amount` },
        })
    }
  }

  const row = await db.query.products.findFirst({
    where: (p, { eq }) => eq(p.productId, id),
    with: { measurementUnitsRef: true },
  })

  return {
    id: row!.productId,
    name: row!.title,
    image: null,
    priceRub: Number(row!.userPrice ?? row!.quantityPerPrice ?? 0),
    priceQty: Number(row!.quantityPerPrice ?? 0),
    priceUnit: row!.measurementUnitsRef.unitAbbr,
    protein: Number(row!.proteins ?? 0),
    fat: Number(row!.fats ?? 0),
    carbs: Number(row!.carbs ?? 0),
    calories: 0,
  }
})
