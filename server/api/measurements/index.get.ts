import { db } from '~~/server/utils/db'

export default defineEventHandler(async () => {
  const rows = await db.query.measurementUnits.findMany()

  return rows.map((u) => ({
    measurement_unit_id: u.measurementUnitId,
    unit_name: u.unitName,
    unit_plural_name: u.unitPluralName,
    measure_type: u.measureType,
    is_standart: u.isStandart,
  }))
})
