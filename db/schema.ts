import { pgTable, index, uniqueIndex, foreignKey, check, serial, integer, varchar, text, date, boolean, numeric, primaryKey } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const recipes = pgTable("recipes", {
	recipeId: serial("recipe_id").primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	editedByUserId: integer("edited_by_user_id"),
	title: varchar({ length: 32 }).notNull(),
	description: text(),
	cookingTimeMin: integer("cooking_time_min"),
	portions: integer().default(4).notNull(),
	createdAt: date("created_at").notNull(),
	isPublic: boolean("is_public").default(false).notNull(),
	pictureUrl: text("picture_url"),
	editedAt: date("edited_at").notNull(),
}, (table) => [
	index("recipe_title_index").using("btree", table.title.asc().nullsLast().op("text_ops")),
	uniqueIndex("recipes_pk").using("btree", table.recipeId.asc().nullsLast().op("int4_ops")),
	index("user_edits_recipes_fk").using("btree", table.editedByUserId.asc().nullsLast().op("int4_ops")),
	index("user_recipes_fk").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.editedByUserId],
			foreignColumns: [users.userId],
			name: "fk_recipes_user_edit_users"
		}).onUpdate("cascade").onDelete("set null"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "fk_recipes_user_reci_users"
		}).onUpdate("restrict").onDelete("cascade"),
	check("ckc_portions_recipes", sql`portions >= 0`),
]);

export const collections = pgTable("collections", {
	collectionId: serial("collection_id").primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	editedByUserId: integer("edited_by_user_id"),
	title: varchar({ length: 32 }).notNull(),
	isPublic: boolean("is_public").default(false).notNull(),
	createdAt: date("created_at").notNull(),
	editedAt: date("edited_at").notNull(),
}, (table) => [
	index("collection_title_index").using("btree", table.title.asc().nullsLast().op("text_ops")),
	uniqueIndex("collections_pk").using("btree", table.collectionId.asc().nullsLast().op("int4_ops")),
	index("user_collections_fk").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	index("user_edits_collections_fk").using("btree", table.editedByUserId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "fk_collecti_user_coll_users"
		}).onUpdate("restrict").onDelete("cascade"),
	foreignKey({
			columns: [table.editedByUserId],
			foreignColumns: [users.userId],
			name: "fk_collecti_user_edit_users"
		}).onUpdate("cascade").onDelete("set null"),
]);

export const users = pgTable("users", {
	userId: serial("user_id").primaryKey().notNull(),
	login: varchar({ length: 32 }).notNull(),
	password: varchar({ length: 1024 }).notNull(),
	name: varchar({ length: 32 }).notNull(),
	createdAt: date("created_at").notNull(),
	avatarUrl: text("avatar_url"),
	role: varchar({ length: 32 }).notNull(),
}, (table) => [
	uniqueIndex("users_pk").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	check("ckc_role_users", sql`(role)::text = ANY ((ARRAY['user'::character varying, 'admin'::character varying])::text[])`),
]);

export const measurementUnits = pgTable("measurement_units", {
	measurementUnitId: serial("measurement_unit_id").primaryKey().notNull(),
	unitName: varchar("unit_name", { length: 50 }).notNull(),
	unitPluralName: varchar("unit_plural_name", { length: 32 }),
	isStandart: boolean("is_standart").notNull(),
	measureType: varchar("measure_type", { length: 32 }).notNull(),
}, (table) => [
	uniqueIndex("measurement_units_pk").using("btree", table.measurementUnitId.asc().nullsLast().op("int4_ops")),
	check("ckc_measure_type_measurem", sql`(measure_type)::text = ANY ((ARRAY['piece'::character varying, 'weight'::character varying, 'volume'::character varying])::text[])`),
]);

export const convertationCoefficients = pgTable("convertation_coefficients", {
	convertationId: serial("convertation_id").primaryKey().notNull(),
	measurementUnitFromId: integer("measurement_unit_from_id").notNull(),
	measurementUnitToId: integer("measurement_unit_to_id").notNull(),
	coefficient: numeric().notNull(),
}, (table) => [
	uniqueIndex("convertation_coefficients_pk").using("btree", table.convertationId.asc().nullsLast().op("int4_ops")),
	index("from_measurement_unit_fk").using("btree", table.measurementUnitFromId.asc().nullsLast().op("int4_ops")),
	index("to_measurement_unit_fk").using("btree", table.measurementUnitToId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.measurementUnitFromId],
			foreignColumns: [measurementUnits.measurementUnitId],
			name: "fk_converta_from_meas_measurem"
		}).onUpdate("restrict").onDelete("restrict"),
	foreignKey({
			columns: [table.measurementUnitToId],
			foreignColumns: [measurementUnits.measurementUnitId],
			name: "fk_converta_to_measur_measurem"
		}).onUpdate("restrict").onDelete("restrict"),
]);

export const emissGoods = pgTable("emiss_goods", {
	emissGoodsId: serial("emiss_goods_id").primaryKey().notNull(),
	emissGoodsName: text("emiss_goods_name").notNull(),
}, (table) => [
	uniqueIndex("emiss_goods_name_index").using("btree", table.emissGoodsName.asc().nullsLast().op("text_ops")),
	uniqueIndex("emiss_goods_pk").using("btree", table.emissGoodsId.asc().nullsLast().op("int4_ops")),
]);

export const families = pgTable("families", {
	familyId: serial("family_id").primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	title: varchar({ length: 32 }).notNull(),
	createdAt: date("created_at").notNull(),
}, (table) => [
	uniqueIndex("families_pk").using("btree", table.familyId.asc().nullsLast().op("int4_ops")),
	index("family_title_index").using("btree", table.title.asc().nullsLast().op("text_ops")),
	index("user_families_fk").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "fk_families_user_fami_users"
		}).onUpdate("restrict").onDelete("cascade"),
]);

export const menus = pgTable("menus", {
	menuId: serial("menu_id").primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	editedByUserId: integer("edited_by_user_id"),
	menuTitle: varchar("menu_title", { length: 128 }).notNull(),
	createdAt: date("created_at").notNull(),
	editedAt: date("edited_at").notNull(),
}, (table) => [
	index("menu_title_index").using("btree", table.menuTitle.asc().nullsLast().op("text_ops")),
	uniqueIndex("menus_pk").using("btree", table.menuId.asc().nullsLast().op("int4_ops")),
	index("user_edits_menus_fk").using("btree", table.editedByUserId.asc().nullsLast().op("int4_ops")),
	index("user_menus_fk").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.editedByUserId],
			foreignColumns: [users.userId],
			name: "fk_menus_user_edit_users"
		}).onUpdate("cascade").onDelete("set null"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "fk_menus_user_menu_users"
		}).onUpdate("restrict").onDelete("cascade"),
]);

export const products = pgTable("products", {
	productId: serial("product_id").primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	measurementUnitId: integer("measurement_unit_id").notNull(),
	emissGoodsId: integer("emiss_goods_id"),
	fdcId: integer("fdc_id"),
	editedByUserId: integer("edited_by_user_id"),
	title: varchar({ length: 32 }).notNull(),
	quantityPrice: numeric("quantity_price").default('0').notNull(),
	userPrice: numeric("user_price").default('0'),
	userCalories: numeric("user_calories").default('0'),
	userProteins: numeric("user_proteins").default('0'),
	userFats: numeric("user_fats").default('0'),
	userCarbs: numeric("user_carbs").default('0'),
	createdAt: date("created_at").notNull(),
	editedAt: date("edited_at").notNull(),
	isPublic: boolean("is_public").default(false).notNull(),
}, (table) => [
	index("product_emiss_goods_fk").using("btree", table.emissGoodsId.asc().nullsLast().op("int4_ops")),
	index("product_fdc_data_fk").using("btree", table.fdcId.asc().nullsLast().op("int4_ops")),
	index("product_measurement_units_fk").using("btree", table.measurementUnitId.asc().nullsLast().op("int4_ops")),
	index("product_title_index").using("btree", table.title.asc().nullsLast().op("text_ops")),
	uniqueIndex("products_pk").using("btree", table.productId.asc().nullsLast().op("int4_ops")),
	index("user_edits_products_fk").using("btree", table.editedByUserId.asc().nullsLast().op("int4_ops")),
	index("user_products_fk").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.emissGoodsId],
			foreignColumns: [emissGoods.emissGoodsId],
			name: "fk_products_product_e_emiss_go"
		}).onUpdate("restrict").onDelete("set null"),
	foreignKey({
			columns: [table.fdcId],
			foreignColumns: [fdcFood.fdcId],
			name: "fk_products_product_f_fdc_food"
		}).onUpdate("restrict").onDelete("set null"),
	foreignKey({
			columns: [table.measurementUnitId],
			foreignColumns: [measurementUnits.measurementUnitId],
			name: "fk_products_product_m_measurem"
		}).onUpdate("restrict").onDelete("restrict"),
	foreignKey({
			columns: [table.editedByUserId],
			foreignColumns: [users.userId],
			name: "fk_products_user_edit_users"
		}).onUpdate("cascade").onDelete("set null"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "fk_products_user_prod_users"
		}).onUpdate("restrict").onDelete("cascade"),
	check("ckc_user_fats_products", sql`(user_fats IS NULL) OR (user_fats >= (0)::numeric)`),
	check("ckc_quantity_price_products", sql`quantity_price >= (0)::numeric`),
	check("ckc_user_price_products", sql`(user_price IS NULL) OR (user_price >= (0)::numeric)`),
	check("ckc_user_calories_products", sql`(user_calories IS NULL) OR (user_calories >= (0)::numeric)`),
	check("ckc_user_proteins_products", sql`(user_proteins IS NULL) OR (user_proteins >= (0)::numeric)`),
	check("ckc_user_carbs_products", sql`(user_carbs IS NULL) OR (user_carbs >= (0)::numeric)`),
]);

export const shoppingLists = pgTable("shopping_lists", {
	shoppingListId: serial("shopping_list_id").primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	editedByUserId: integer("edited_by_user_id"),
	title: varchar({ length: 32 }).notNull(),
	createdAt: date("created_at").notNull(),
	editedAt: date("edited_at").notNull(),
}, (table) => [
	uniqueIndex("shopping_lists_pk").using("btree", table.shoppingListId.asc().nullsLast().op("int4_ops")),
	index().using("btree", table.title.asc().nullsLast().op("text_ops")),
	index("user_edits_shopping_lists_fk").using("btree", table.editedByUserId.asc().nullsLast().op("int4_ops")),
	index("user_shopping_lists_fk").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.editedByUserId],
			foreignColumns: [users.userId],
			name: "fk_shopping_user_edit_users"
		}).onUpdate("cascade").onDelete("set null"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "fk_shopping_user_shop_users"
		}).onUpdate("restrict").onDelete("cascade"),
]);

export const fdcFood = pgTable("fdc_food", {
	fdcId: integer("fdc_id").primaryKey().notNull(),
	fdcName: text("fdc_name").notNull(),
	fdcTranslatedName: text("fdc_translated_name"),
}, (table) => [
	uniqueIndex("fdc_food_pk").using("btree", table.fdcId.asc().nullsLast().op("int4_ops")),
	uniqueIndex("fdc_name_index").using("btree", table.fdcName.asc().nullsLast().op("text_ops")),
]);

export const grades = pgTable("grades", {
	gradeId: serial("grade_id").primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	recipeId: integer("recipe_id").notNull(),
	grade: integer().notNull(),
	createdAt: date("created_at").notNull(),
}, (table) => [
	uniqueIndex("grades_pk").using("btree", table.gradeId.asc().nullsLast().op("int4_ops")),
	index("recipe_grades_fk").using("btree", table.recipeId.asc().nullsLast().op("int4_ops")),
	index("user_grades_fk").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.recipeId],
			foreignColumns: [recipes.recipeId],
			name: "fk_grades_recipe_gr_recipes"
		}).onUpdate("restrict").onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "fk_grades_user_grad_users"
		}).onUpdate("restrict").onDelete("cascade"),
	check("ckc_grade_grades", sql`(grade >= 0) AND (grade <= 5)`),
]);

export const ingredients = pgTable("ingredients", {
	ingredientId: serial("ingredient_id").primaryKey().notNull(),
	recipeId: integer("recipe_id").notNull(),
	productId: integer("product_id").notNull(),
	measurementUnitId: integer("measurement_unit_id").notNull(),
	quantity: numeric().default('1').notNull(),
	isOptional: boolean("is_optional").default(false).notNull(),
	note: varchar({ length: 128 }),
}, (table) => [
	index("ingredient_recipes_fk").using("btree", table.recipeId.asc().nullsLast().op("int4_ops")),
	index("measurement_unit_ingredients_fk").using("btree", table.measurementUnitId.asc().nullsLast().op("int4_ops")),
	index("product_ingredients_fk").using("btree", table.productId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.recipeId],
			foreignColumns: [recipes.recipeId],
			name: "fk_ingredie_ingredien_recipes"
		}).onUpdate("restrict").onDelete("cascade"),
	foreignKey({
			columns: [table.measurementUnitId],
			foreignColumns: [measurementUnits.measurementUnitId],
			name: "fk_ingredie_measureme_measurem"
		}).onUpdate("restrict").onDelete("restrict"),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.productId],
			name: "fk_ingredie_product_i_products"
		}).onUpdate("restrict").onDelete("restrict"),
	check("ckc_quantity_ingredie", sql`quantity >= (0)::numeric`),
]);

export const invitations = pgTable("invitations", {
	inviteId: serial("invite_id").primaryKey().notNull(),
	familyId: integer("family_id").notNull(),
	userId: integer("user_id").notNull(),
	status: varchar({ length: 20 }).notNull(),
	createdAt: date("created_at").notNull(),
}, (table) => [
	index("family_invites_fk").using("btree", table.familyId.asc().nullsLast().op("int4_ops")),
	uniqueIndex("invitations_pk").using("btree", table.inviteId.asc().nullsLast().op("int4_ops")),
	index("user_invitations_fk").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.familyId],
			foreignColumns: [families.familyId],
			name: "fk_invitati_family_in_families"
		}).onUpdate("restrict").onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "fk_invitati_user_invi_users"
		}).onUpdate("restrict").onDelete("cascade"),
	check("ckc_status_invitati", sql`(status)::text = ANY ((ARRAY['sent'::character varying, 'accepted'::character varying, 'denied'::character varying, 'cancelled'::character varying])::text[])`),
]);

export const meals = pgTable("meals", {
	mealId: serial("meal_id").primaryKey().notNull(),
	planDateId: integer("plan_date_id").notNull(),
	mealTitle: varchar("meal_title", { length: 32 }).notNull(),
	mealOrder: integer("meal_order").notNull(),
}, (table) => [
	uniqueIndex("meals_pk").using("btree", table.mealId.asc().nullsLast().op("int4_ops")),
	index("plan_date_meals_fk").using("btree", table.planDateId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.planDateId],
			foreignColumns: [planDates.planDateId],
			name: "fk_meals_plan_date_plan_dat"
		}).onUpdate("restrict").onDelete("cascade"),
]);

export const listElements = pgTable("list_elements", {
	elementId: serial("element_id").primaryKey().notNull(),
	shoppingListId: integer("shopping_list_id").notNull(),
	productId: integer("product_id"),
	mealId: integer("meal_id"),
	measurementUnitId: integer("measurement_unit_id").notNull(),
	userId: integer("user_id"),
	isChecked: boolean("is_checked").notNull(),
	userTitle: varchar("user_title", { length: 255 }),
	quantity: numeric().default('1').notNull(),
	isManual: boolean("is_manual").notNull(),
}, (table) => [
	index("list_elem_measure_units_fk").using("btree", table.measurementUnitId.asc().nullsLast().op("int4_ops")),
	index("list_element_meals_fk").using("btree", table.mealId.asc().nullsLast().op("int4_ops")),
	uniqueIndex("list_elements_pk").using("btree", table.elementId.asc().nullsLast().op("int4_ops")),
	index("list_elements_products_fk").using("btree", table.productId.asc().nullsLast().op("int4_ops")),
	index("shopping_list_list_elements_fk").using("btree", table.shoppingListId.asc().nullsLast().op("int4_ops")),
	index("user_adds_elements_fk").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.mealId],
			foreignColumns: [meals.mealId],
			name: "fk_list_ele_list_elem_meals"
		}).onUpdate("restrict").onDelete("set null"),
	foreignKey({
			columns: [table.measurementUnitId],
			foreignColumns: [measurementUnits.measurementUnitId],
			name: "fk_list_ele_list_elem_measurem"
		}).onUpdate("restrict").onDelete("restrict"),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.productId],
			name: "fk_list_ele_list_elem_products"
		}).onUpdate("restrict").onDelete("set null"),
	foreignKey({
			columns: [table.shoppingListId],
			foreignColumns: [shoppingLists.shoppingListId],
			name: "fk_list_ele_shopping__shopping"
		}).onUpdate("restrict").onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "fk_list_ele_user_adds_users"
		}).onUpdate("restrict").onDelete("set null"),
	check("ckc_quantity_list_ele", sql`quantity >= (0)::numeric`),
]);

export const planDates = pgTable("plan_dates", {
	planDateId: serial("plan_date_id").primaryKey().notNull(),
	menuId: integer("menu_id").notNull(),
	planDate: date("plan_date").notNull(),
}, (table) => [
	index("menu_plan_dates_fk").using("btree", table.menuId.asc().nullsLast().op("int4_ops")),
	uniqueIndex("plan_dates_pk").using("btree", table.planDateId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.menuId],
			foreignColumns: [menus.menuId],
			name: "fk_plan_dat_menu_plan_menus"
		}).onUpdate("restrict").onDelete("cascade"),
]);

export const collectionRecipes = pgTable("collection_recipes", {
	recipeId: integer("recipe_id").notNull(),
	collectionId: integer("collection_id").notNull(),
}, (table) => [
	index("collection_recipes2_fk").using("btree", table.collectionId.asc().nullsLast().op("int4_ops")),
	index("collection_recipes_fk").using("btree", table.recipeId.asc().nullsLast().op("int4_ops")),
	uniqueIndex("collection_recipes_pk").using("btree", table.recipeId.asc().nullsLast().op("int4_ops"), table.collectionId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.recipeId],
			foreignColumns: [recipes.recipeId],
			name: "fk_collecti_collectio_recipes"
		}).onUpdate("restrict").onDelete("cascade"),
	foreignKey({
			columns: [table.collectionId],
			foreignColumns: [collections.collectionId],
			name: "fk_collecti_collectio_collecti"
		}).onUpdate("restrict").onDelete("cascade"),
	primaryKey({ columns: [table.recipeId, table.collectionId], name: "pk_collection_recipes"}),
]);

export const mealRecipes = pgTable("meal_recipes", {
	recipeId: integer("recipe_id").notNull(),
	mealId: integer("meal_id").notNull(),
}, (table) => [
	index("meal_recipes2_fk").using("btree", table.mealId.asc().nullsLast().op("int4_ops")),
	index("meal_recipes_fk").using("btree", table.recipeId.asc().nullsLast().op("int4_ops")),
	uniqueIndex("meal_recipes_pk").using("btree", table.recipeId.asc().nullsLast().op("int4_ops"), table.mealId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.recipeId],
			foreignColumns: [recipes.recipeId],
			name: "fk_meal_rec_meal_reci_recipes"
		}).onUpdate("restrict").onDelete("cascade"),
	foreignKey({
			columns: [table.mealId],
			foreignColumns: [meals.mealId],
			name: "fk_meal_rec_meal_reci_meals"
		}).onUpdate("restrict").onDelete("cascade"),
	primaryKey({ columns: [table.recipeId, table.mealId], name: "pk_meal_recipes"}),
]);

export const shoppingListMenus = pgTable("shopping_list_menus", {
	menuId: integer("menu_id").notNull(),
	shoppingListId: integer("shopping_list_id").notNull(),
}, (table) => [
	index("shopping_list_menus2_fk").using("btree", table.shoppingListId.asc().nullsLast().op("int4_ops")),
	index("shopping_list_menus_fk").using("btree", table.menuId.asc().nullsLast().op("int4_ops")),
	uniqueIndex("shopping_list_menus_pk").using("btree", table.menuId.asc().nullsLast().op("int4_ops"), table.shoppingListId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.menuId],
			foreignColumns: [menus.menuId],
			name: "fk_shopping_shopping__menus"
		}).onUpdate("restrict").onDelete("cascade"),
	foreignKey({
			columns: [table.shoppingListId],
			foreignColumns: [shoppingLists.shoppingListId],
			name: "fk_shopping_shopping__shopping"
		}).onUpdate("restrict").onDelete("cascade"),
	primaryKey({ columns: [table.shoppingListId, table.menuId], name: "pk_shopping_list_menus"}),
]);

export const userAMemberOfFamilies = pgTable("user_a_member_of_families", {
	familyId: integer("family_id").notNull(),
	userId: integer("user_id").notNull(),
}, (table) => [
	index("user_a_member_of_families2_fk").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	index("user_a_member_of_families_fk").using("btree", table.familyId.asc().nullsLast().op("int4_ops")),
	uniqueIndex("user_a_member_of_families_pk").using("btree", table.familyId.asc().nullsLast().op("int4_ops"), table.userId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.familyId],
			foreignColumns: [families.familyId],
			name: "fk_user_a_m_user_a_me_families"
		}).onUpdate("restrict").onDelete("restrict"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "fk_user_a_m_user_a_me_users"
		}).onUpdate("restrict").onDelete("cascade"),
	primaryKey({ columns: [table.userId, table.familyId], name: "pk_user_a_member_of_families"}),
]);

export const emissRecords = pgTable("emiss_records", {
	emissGoodsId: integer("emiss_goods_id").notNull(),
	recordDate: date("record_date").notNull(),
	recordPrice: numeric("record_price").notNull(),
}, (table) => [
	index("emiss_good_emiss_records_fk").using("btree", table.emissGoodsId.asc().nullsLast().op("int4_ops")),
	uniqueIndex("emiss_records_pk").using("btree", table.emissGoodsId.asc().nullsLast().op("int4_ops"), table.recordDate.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.emissGoodsId],
			foreignColumns: [emissGoods.emissGoodsId],
			name: "fk_emiss_re_emiss_goo_emiss_go"
		}).onUpdate("restrict").onDelete("cascade"),
	primaryKey({ columns: [table.recordDate, table.emissGoodsId], name: "pk_emiss_records"}),
]);

export const familyCollectionsAccess = pgTable("family_collections_access", {
	familyId: integer("family_id").notNull(),
	collectionId: integer("collection_id").notNull(),
	canView: boolean("can_view").default(false).notNull(),
	canEdit: boolean("can_edit").default(false).notNull(),
}, (table) => [
	index("col_fam_access_fk").using("btree", table.collectionId.asc().nullsLast().op("int4_ops")),
	index("fam_col_access_fk").using("btree", table.familyId.asc().nullsLast().op("int4_ops")),
	uniqueIndex("family_collections_access_pk").using("btree", table.familyId.asc().nullsLast().op("int4_ops"), table.collectionId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.collectionId],
			foreignColumns: [collections.collectionId],
			name: "fk_family_c_collectio_collecti"
		}).onUpdate("restrict").onDelete("cascade"),
	foreignKey({
			columns: [table.familyId],
			foreignColumns: [families.familyId],
			name: "fk_family_c_family_co_families"
		}).onUpdate("restrict").onDelete("cascade"),
	primaryKey({ columns: [table.familyId, table.collectionId], name: "pk_family_collections_access"}),
]);

export const familyMenusAccess = pgTable("family_menus_access", {
	menuId: integer("menu_id").notNull(),
	familyId: integer("family_id").notNull(),
	canView: boolean("can_view").default(false).notNull(),
	canEdit: boolean("can_edit").default(false).notNull(),
}, (table) => [
	index("family_menus_access_link_fk").using("btree", table.familyId.asc().nullsLast().op("int4_ops")),
	uniqueIndex("family_menus_access_pk").using("btree", table.menuId.asc().nullsLast().op("int4_ops"), table.familyId.asc().nullsLast().op("int4_ops")),
	index("menu_families_access_link_fk").using("btree", table.menuId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.familyId],
			foreignColumns: [families.familyId],
			name: "fk_family_m_family_me_families"
		}).onUpdate("restrict").onDelete("cascade"),
	foreignKey({
			columns: [table.menuId],
			foreignColumns: [menus.menuId],
			name: "fk_family_m_menu_fami_menus"
		}).onUpdate("restrict").onDelete("cascade"),
	primaryKey({ columns: [table.menuId, table.familyId], name: "pk_family_menus_access"}),
]);

export const familyProductsAccess = pgTable("family_products_access", {
	productId: integer("product_id").notNull(),
	familyId: integer("family_id").notNull(),
	canView: boolean("can_view").default(false).notNull(),
	canEdit: boolean("can_edit").default(false).notNull(),
}, (table) => [
	index("family_products_access_link_fk").using("btree", table.familyId.asc().nullsLast().op("int4_ops")),
	uniqueIndex("family_products_access_pk").using("btree", table.productId.asc().nullsLast().op("int4_ops"), table.familyId.asc().nullsLast().op("int4_ops")),
	index("product_families_access_link_fk").using("btree", table.productId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.familyId],
			foreignColumns: [families.familyId],
			name: "fk_family_p_family_pr_families"
		}).onUpdate("restrict").onDelete("cascade"),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.productId],
			name: "fk_family_p_product_f_products"
		}).onUpdate("restrict").onDelete("cascade"),
	primaryKey({ columns: [table.productId, table.familyId], name: "pk_family_products_access"}),
]);

export const familyRecipesAccess = pgTable("family_recipes_access", {
	recipeId: integer("recipe_id").notNull(),
	familyId: integer("family_id").notNull(),
	canView: boolean("can_view").default(false).notNull(),
	canEdit: boolean("can_edit").default(false).notNull(),
}, (table) => [
	index("family_recipes_access_link_fk").using("btree", table.familyId.asc().nullsLast().op("int4_ops")),
	uniqueIndex("family_recipes_access_pk").using("btree", table.recipeId.asc().nullsLast().op("int4_ops"), table.familyId.asc().nullsLast().op("int4_ops")),
	index("recipe_families_access_link_fk").using("btree", table.recipeId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.familyId],
			foreignColumns: [families.familyId],
			name: "fk_family_r_family_re_families"
		}).onUpdate("restrict").onDelete("cascade"),
	foreignKey({
			columns: [table.recipeId],
			foreignColumns: [recipes.recipeId],
			name: "fk_family_r_recipe_fa_recipes"
		}).onUpdate("restrict").onDelete("cascade"),
	primaryKey({ columns: [table.recipeId, table.familyId], name: "pk_family_recipes_access"}),
]);

export const familyShoppingListsAccess = pgTable("family_shopping_lists_access", {
	shoppingListId: integer("shopping_list_id").notNull(),
	familyId: integer("family_id").notNull(),
	canView: boolean("can_view").default(false).notNull(),
	canEdit: boolean("can_edit").default(false).notNull(),
}, (table) => [
	index("fam_shop_lists_access_fk").using("btree", table.familyId.asc().nullsLast().op("int4_ops")),
	uniqueIndex("family_shopping_lists_access_pk").using("btree", table.shoppingListId.asc().nullsLast().op("int4_ops"), table.familyId.asc().nullsLast().op("int4_ops")),
	index("shop_list_fam_access_fk").using("btree", table.shoppingListId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.familyId],
			foreignColumns: [families.familyId],
			name: "fk_family_s_family_sh_families"
		}).onUpdate("restrict").onDelete("cascade"),
	foreignKey({
			columns: [table.shoppingListId],
			foreignColumns: [shoppingLists.shoppingListId],
			name: "fk_family_s_shopping__shopping"
		}).onUpdate("restrict").onDelete("cascade"),
	primaryKey({ columns: [table.shoppingListId, table.familyId], name: "pk_family_shopping_lists_acces"}),
]);

export const recipeSteps = pgTable("recipe_steps", {
	recipeId: integer("recipe_id").notNull(),
	order: numeric().notNull(),
	description: text().notNull(),
	pictureUrl: text("picture_url"),
}, (table) => [
	index("recipe_recipe_steps_fk").using("btree", table.recipeId.asc().nullsLast().op("int4_ops")),
	uniqueIndex("recipe_steps_pk").using("btree", table.recipeId.asc().nullsLast().op("numeric_ops"), table.order.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.recipeId],
			foreignColumns: [recipes.recipeId],
			name: "fk_recipe_s_recipe_re_recipes"
		}).onUpdate("restrict").onDelete("cascade"),
	primaryKey({ columns: [table.recipeId, table.order], name: "pk_recipe_steps"}),
]);

export const fdcRecords = pgTable("fdc_records", {
	fdcId: integer("fdc_id").notNull(),
	fdcResearchDate: date("fdc_research_date").notNull(),
	fdcCalories: numeric("fdc_calories").notNull(),
	fdcCarbs: numeric("fdc_carbs").notNull(),
	fdcFats: numeric("fdc_fats").notNull(),
	fdcProteins: numeric("fdc_proteins").notNull(),
}, (table) => [
	index("fdc_food_fdc_record_fk").using("btree", table.fdcId.asc().nullsLast().op("int4_ops")),
	uniqueIndex("fdc_records_pk").using("btree", table.fdcId.asc().nullsLast().op("int4_ops"), table.fdcResearchDate.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.fdcId],
			foreignColumns: [fdcFood.fdcId],
			name: "fk_fdc_reco_fdc_food__fdc_food"
		}).onUpdate("restrict").onDelete("cascade"),
	primaryKey({ columns: [table.fdcResearchDate, table.fdcId], name: "pk_fdc_records"}),
]);
