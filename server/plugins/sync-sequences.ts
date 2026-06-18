import { sql } from 'drizzle-orm'
import { db } from '~~/server/utils/db'

// Синхронизирует sequence с реальными данными после восстановления бекапа
export default defineNitroPlugin(async () => {
  const tables: [string, string][] = [
    ['users', 'user_id'],
    ['families', 'family_id'],
    ['recipes', 'recipe_id'],
    ['ingredients', 'ingredient_id'],
    ['products', 'product_id'],
    ['invitations', 'invite_id'],
    ['list_elements', 'element_id'],
    ['shopping_lists', 'shopping_list_id'],
    ['meals', 'meal_id'],
    ['plan_dates', 'plan_date_id'],
    ['menus', 'menu_id'],
    ['measurement_units_ref', 'measurement_unit_id'],
    ['emiss_goods', 'emiss_goods_id'],
  ]

  for (const [table, column] of tables) {
    await db.execute(
      sql.raw(`SELECT setval(pg_get_serial_sequence('${table}', '${column}'), GREATEST(MAX(${column}), 1)) FROM ${table}`)
    )
  }
})
