import { db } from '~~/server/utils/db'

export default defineEventHandler(async () => {
  const rows = await db.query.measurementUnitsRef.findMany()

  return rows.map((u) => ({
    measurement_unit_id: u.measurementUnitId,
    unit_name: u.unitName,
    unit_abbr: u.unitAbbr,
    measure_type: u.measureType,
    is_standart: u.isStandart,
  }))
})
