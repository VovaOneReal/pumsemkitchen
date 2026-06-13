import { db } from '~~/server/utils/db'
import { products, productMeasuresInUnits, measurementUnitsRef } from '~~/db/schema'
import { createProductSchema } from '~~/schemas/product'
import { inArray } from 'drizzle-orm'

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
    userPrice: String(body.user_price),
    quantityPerPrice: String(body.quantity_per_price),
    isPublic: body.is_public,
    createdAt: today,
    editedAt: today,
  }).returning()

  // Запись пропорций в единицах измерения, если пользователь указал хотя бы одну
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

    const measuresToInsert = measureFields
      .map((m) => ({ unitId: unitMap.get(m.key), amount: m.value }))
      .filter((m): m is { unitId: number; amount: number } => m.unitId != null)

    if (measuresToInsert.length > 0) {
      await db.insert(productMeasuresInUnits).values(
        measuresToInsert.map((m) => ({
          productId: created.productId,
          measurementUnitId: m.unitId,
          productMeasureAmount: String(m.amount),
        })),
      )
    }
  }

  const row = await db.query.products.findFirst({
    where: (p, { eq }) => eq(p.productId, created.productId),
    with: {
      measurementUnitsRef: true,
      productMeasuresInUnits: { with: { measurementUnitsRef: true } },
    },
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
    isPublic: row!.isPublic,
    isOwn: true,
    measures: row!.productMeasuresInUnits.map((m) => ({
      unitId: m.measurementUnitId,
      unitName: m.measurementUnitsRef.unitName,
      unitAbbr: m.measurementUnitsRef.unitAbbr,
      amount: Number(m.productMeasureAmount),
    })),
  }
})
