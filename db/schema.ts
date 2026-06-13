import { pgTable, index, uniqueIndex, foreignKey, check, serial, integer, varchar, text, date, boolean, numeric, primaryKey, pgView } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const recipes = pgTable("recipes", {
	recipeId: serial("recipe_id").primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	editUserId: integer("edit_user_id"),
	familyId: integer("family_id").notNull(),
	title: varchar({ length: 128 }).notNull(),
	description: text(),
	cookingTimeMin: integer("cooking_time_min"),
	portions: integer().default(4).notNull(),
	createdAt: date("created_at").notNull(),
	isPublic: boolean("is_public").default(false).notNull(),
	pictureUrl: text("picture_url"),
	editedAt: date("edited_at").notNull(),
	sourceUrl: text("source_url"),
}, (table) => [
	index("family_recipes_fk").using("btree", table.familyId.asc().nullsLast().op("int4_ops")),
	index("recipe_created_at_index").using("btree", table.createdAt.asc().nullsLast().op("date_ops")),
	index("recipe_edited_at_index").using("btree", table.editedAt.asc().nullsLast().op("date_ops")),
	uniqueIndex("recipes_pk").using("btree", table.recipeId.asc().nullsLast().op("int4_ops")),
	index("user_edits_recipes_fk").using("btree", table.editUserId.asc().nullsLast().op("int4_ops")),
	index("user_recipes_fk").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.familyId],
			foreignColumns: [families.familyId],
			name: "fk_recipes_family_re_families"
		}).onUpdate("restrict").onDelete("cascade"),
	foreignKey({
			columns: [table.editUserId],
			foreignColumns: [users.userId],
			name: "fk_recipes_user_edit_users"
		}).onUpdate("restrict").onDelete("cascade"),
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
	editUserId: integer("edit_user_id"),
	familyId: integer("family_id").notNull(),
	title: varchar({ length: 128 }).notNull(),
	createdAt: date("created_at").notNull(),
	editedAt: date("edited_at").notNull(),
}, (table) => [
	index("collection_created_at_index").using("btree", table.createdAt.asc().nullsLast().op("date_ops")),
	index("collection_edited_at_index").using("btree", table.editedAt.asc().nullsLast().op("date_ops")),
	uniqueIndex("collections_pk").using("btree", table.collectionId.asc().nullsLast().op("int4_ops")),
	index("family_collections_fk").using("btree", table.familyId.asc().nullsLast().op("int4_ops")),
	index("user_collections_fk").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	index("user_edits_collections_fk").using("btree", table.editUserId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.familyId],
			foreignColumns: [families.familyId],
			name: "fk_collecti_family_co_families"
		}).onUpdate("restrict").onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "fk_collecti_user_coll_users"
		}).onUpdate("restrict").onDelete("cascade"),
	foreignKey({
			columns: [table.editUserId],
			foreignColumns: [users.userId],
			name: "fk_collecti_user_edit_users"
		}).onUpdate("restrict").onDelete("cascade"),
]);

export const families = pgTable("families", {
	familyId: serial("family_id").primaryKey().notNull(),
	ownerUserId: integer("owner_user_id").notNull(),
	title: varchar({ length: 128 }).notNull(),
	createdAt: date("created_at").notNull(),
}, (table) => [
	uniqueIndex("families_pk").using("btree", table.familyId.asc().nullsLast().op("int4_ops")),
	index("family_created_at_index").using("btree", table.createdAt.asc().nullsLast().op("date_ops")),
	index("user_families_fk").using("btree", table.ownerUserId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.ownerUserId],
			foreignColumns: [users.userId],
			name: "fk_families_user_fami_users"
		}).onUpdate("restrict").onDelete("cascade"),
]);

export const users = pgTable("users", {
	userId: serial("user_id").primaryKey().notNull(),
	login: varchar({ length: 32 }).notNull(),
	password: varchar({ length: 1024 }).notNull(),
	name: varchar({ length: 32 }).notNull(),
	createdAt: date("created_at").notNull(),
	role: varchar({ length: 32 }).notNull(),
}, (table) => [
	index("user_created_at_index").using("btree", table.createdAt.asc().nullsLast().op("date_ops")),
	uniqueIndex("user_login_index").using("btree", table.login.asc().nullsLast().op("text_ops")),
	uniqueIndex("users_pk").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	check("ckc_role_users", sql`(role)::text = ANY ((ARRAY['user'::character varying, 'admin'::character varying])::text[])`),
]);

export const measurementUnitsRef = pgTable("measurement_units_ref", {
	measurementUnitId: serial("measurement_unit_id").primaryKey().notNull(),
	unitName: varchar("unit_name", { length: 50 }).notNull(),
	unitAbbr: varchar("unit_abbr", { length: 32 }).notNull(),
	isStandart: boolean("is_standart").notNull(),
	measureType: varchar("measure_type", { length: 32 }).notNull(),
}, (table) => [
	uniqueIndex("measure_unit_abbr_index").using("btree", table.unitAbbr.asc().nullsLast().op("text_ops")),
	uniqueIndex("measurement_units_ref_pk").using("btree", table.measurementUnitId.asc().nullsLast().op("int4_ops")),
	check("ckc_measure_type_measurem", sql`(measure_type)::text = ANY ((ARRAY['piece'::character varying, 'weight'::character varying, 'volume'::character varying])::text[])`),
]);

export const emissGoods = pgTable("emiss_goods", {
	emissGoodsId: serial("emiss_goods_id").primaryKey().notNull(),
	emissGoodsName: text("emiss_goods_name").notNull(),
}, (table) => [
	uniqueIndex("emiss_goods_pk").using("btree", table.emissGoodsId.asc().nullsLast().op("int4_ops")),
]);

export const ingredients = pgTable("ingredients", {
	ingredientId: serial("ingredient_id").primaryKey().notNull(),
	productId: integer("product_id").notNull(),
	recipeId: integer("recipe_id").notNull(),
	measurementUnitId: integer("measurement_unit_id").notNull(),
	quantity: numeric().default('1').notNull(),
	isOptional: boolean("is_optional").default(false).notNull(),
	note: varchar({ length: 128 }),
}, (table) => [
	index("ingredient_recipes_fk").using("btree", table.recipeId.asc().nullsLast().op("int4_ops")),
	uniqueIndex("ingredients_pk").using("btree", table.ingredientId.asc().nullsLast().op("int4_ops")),
	index("measurement_unit_ingredients_fk").using("btree", table.measurementUnitId.asc().nullsLast().op("int4_ops")),
	index("product_ingredients_fk").using("btree", table.productId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.recipeId],
			foreignColumns: [recipes.recipeId],
			name: "fk_ingredie_ingredien_recipes"
		}).onUpdate("restrict").onDelete("cascade"),
	foreignKey({
			columns: [table.measurementUnitId],
			foreignColumns: [measurementUnitsRef.measurementUnitId],
			name: "fk_ingredie_measureme_measurem"
		}).onUpdate("restrict").onDelete("restrict"),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.productId],
			name: "fk_ingredie_product_i_products"
		}).onUpdate("restrict").onDelete("restrict"),
	check("ckc_quantity_ingredie", sql`quantity >= (0)::numeric`),
]);

export const products = pgTable("products", {
	productId: serial("product_id").primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	measurementUnitId: integer("measurement_unit_id").notNull(),
	emissGoodsId: integer("emiss_goods_id"),
	editUserId: integer("edit_user_id"),
	familyId: integer("family_id"),
	priceFromProductId: integer("price_from_product_id"),
	nutritionsFromProductId: integer("nutritions_from_product_id"),
	title: varchar({ length: 128 }).notNull(),
	quantityPerPrice: numeric("quantity_per_price").default('0'),
	userPrice: numeric("user_price").default('0'),
	proteins: numeric().default('0'),
	fats: numeric().default('0'),
	carbs: numeric().default('0'),
	createdAt: date("created_at").notNull(),
	editedAt: date("edited_at").notNull(),
	isPublic: boolean("is_public").default(false).notNull(),
}, (table) => [
	index("family_products_fk").using("btree", table.familyId.asc().nullsLast().op("int4_ops")),
	index("prod_ref_pub_nutritions_fk").using("btree", table.nutritionsFromProductId.asc().nullsLast().op("int4_ops")),
	index("product_created_at_index").using("btree", table.createdAt.asc().nullsLast().op("date_ops")),
	index("product_edited_at_index").using("btree", table.editedAt.asc().nullsLast().op("date_ops")),
	index("product_emiss_goods_fk").using("btree", table.emissGoodsId.asc().nullsLast().op("int4_ops")),
	index("product_price_per_unit_fk").using("btree", table.measurementUnitId.asc().nullsLast().op("int4_ops")),
	index("product_refs_public_price_fk").using("btree", table.priceFromProductId.asc().nullsLast().op("int4_ops")),
	uniqueIndex("products_pk").using("btree", table.productId.asc().nullsLast().op("int4_ops")),
	index("user_edits_products_fk").using("btree", table.editUserId.asc().nullsLast().op("int4_ops")),
	index("user_products_fk").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.familyId],
			foreignColumns: [families.familyId],
			name: "fk_products_family_pr_families"
		}).onUpdate("restrict").onDelete("cascade"),
	foreignKey({
			columns: [table.emissGoodsId],
			foreignColumns: [emissGoods.emissGoodsId],
			name: "fk_products_product_e_emiss_go"
		}).onUpdate("restrict").onDelete("set null"),
	foreignKey({
			columns: [table.measurementUnitId],
			foreignColumns: [measurementUnitsRef.measurementUnitId],
			name: "fk_products_product_p_measurem"
		}).onUpdate("restrict").onDelete("restrict"),
	foreignKey({
			columns: [table.nutritionsFromProductId],
			foreignColumns: [table.productId],
			name: "fk_products_refs_pub_nutrition"
		}).onUpdate("restrict").onDelete("set null"),
	foreignKey({
			columns: [table.priceFromProductId],
			foreignColumns: [table.productId],
			name: "fk_products_refs_pub_price"
		}).onUpdate("restrict").onDelete("set null"),
	foreignKey({
			columns: [table.editUserId],
			foreignColumns: [users.userId],
			name: "fk_products_user_edit_users"
		}).onUpdate("restrict").onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "fk_products_user_prod_users"
		}).onUpdate("restrict").onDelete("cascade"),
	check("ckc_fats_products", sql`(fats IS NULL) OR (fats >= (0)::numeric)`),
	check("ckc_quantity_per_pric_products", sql`(quantity_per_price IS NULL) OR (quantity_per_price >= (0)::numeric)`),
	check("ckc_user_price_products", sql`(user_price IS NULL) OR (user_price >= (0)::numeric)`),
	check("ckc_proteins_products", sql`(proteins IS NULL) OR (proteins >= (0)::numeric)`),
	check("ckc_carbs_products", sql`(carbs IS NULL) OR (carbs >= (0)::numeric)`),
]);

export const invitations = pgTable("invitations", {
	inviteId: serial("invite_id").primaryKey().notNull(),
	familyId: integer("family_id").notNull(),
	userId: integer("user_id").notNull(),
	status: varchar({ length: 20 }).notNull(),
	createdAt: date("created_at").notNull(),
}, (table) => [
	index("family_invites_fk").using("btree", table.familyId.asc().nullsLast().op("int4_ops")),
	index("invitation_created_at_index").using("btree", table.createdAt.asc().nullsLast().op("date_ops")),
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

export const listElements = pgTable("list_elements", {
	elementId: serial("element_id").primaryKey().notNull(),
	shoppingListId: integer("shopping_list_id").notNull(),
	measurementUnitId: integer("measurement_unit_id").notNull(),
	userId: integer("user_id"),
	productId: integer("product_id"),
	isChecked: boolean("is_checked").notNull(),
	userProductTitle: varchar("user_product_title", { length: 128 }),
	quantity: numeric().default('1').notNull(),
}, (table) => [
	index("list_elem_meas_units_fk").using("btree", table.measurementUnitId.asc().nullsLast().op("int4_ops")),
	uniqueIndex("list_elements_pk").using("btree", table.elementId.asc().nullsLast().op("int4_ops")),
	index("product_list_items_fk").using("btree", table.productId.asc().nullsLast().op("int4_ops")),
	index("shopping_list_list_elements_fk").using("btree", table.shoppingListId.asc().nullsLast().op("int4_ops")),
	index("user_adds_elements_fk").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.measurementUnitId],
			foreignColumns: [measurementUnitsRef.measurementUnitId],
			name: "fk_list_ele_list_elem_measurem"
		}).onUpdate("restrict").onDelete("restrict"),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.productId],
			name: "fk_list_ele_product_l_products"
		}).onUpdate("restrict").onDelete("restrict"),
	foreignKey({
			columns: [table.shoppingListId],
			foreignColumns: [shoppingLists.shoppingListId],
			name: "fk_list_ele_shopping__shopping"
		}).onUpdate("restrict").onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "fk_list_ele_user_adds_users"
		}).onUpdate("restrict").onDelete("cascade"),
	check("ckc_quantity_list_ele", sql`quantity >= (0)::numeric`),
]);

export const shoppingLists = pgTable("shopping_lists", {
	shoppingListId: serial("shopping_list_id").primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	editUserId: integer("edit_user_id"),
	familyId: integer("family_id").notNull(),
	title: varchar({ length: 128 }).notNull(),
	createdAt: date("created_at").notNull(),
	editedAt: date("edited_at").notNull(),
}, (table) => [
	index("family_shopping_lists_fk").using("btree", table.familyId.asc().nullsLast().op("int4_ops")),
	index("shopping_list_created_at_index").using("btree", table.createdAt.asc().nullsLast().op("date_ops")),
	index("shopping_list_edited_at_index").using("btree", table.editedAt.asc().nullsLast().op("date_ops")),
	uniqueIndex("shopping_lists_pk").using("btree", table.shoppingListId.asc().nullsLast().op("int4_ops")),
	index("user_edits_shopping_lists_fk").using("btree", table.editUserId.asc().nullsLast().op("int4_ops")),
	index("user_shopping_lists_fk").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.familyId],
			foreignColumns: [families.familyId],
			name: "fk_shopping_family_sh_families"
		}).onUpdate("restrict").onDelete("cascade"),
	foreignKey({
			columns: [table.editUserId],
			foreignColumns: [users.userId],
			name: "fk_shopping_user_edit_users"
		}).onUpdate("restrict").onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "fk_shopping_user_shop_users"
		}).onUpdate("restrict").onDelete("cascade"),
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

export const planDates = pgTable("plan_dates", {
	planDateId: serial("plan_date_id").primaryKey().notNull(),
	menuId: integer("menu_id").notNull(),
	planDate: date("plan_date").notNull(),
}, (table) => [
	index("menu_plan_dates_fk").using("btree", table.menuId.asc().nullsLast().op("int4_ops")),
	index("plan_date_index").using("btree", table.planDate.asc().nullsLast().op("date_ops")),
	uniqueIndex("plan_dates_pk").using("btree", table.planDateId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.menuId],
			foreignColumns: [menus.menuId],
			name: "fk_plan_dat_menu_plan_menus"
		}).onUpdate("restrict").onDelete("cascade"),
]);

export const menus = pgTable("menus", {
	menuId: serial("menu_id").primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	editUserId: integer("edit_user_id"),
	familyId: integer("family_id").notNull(),
	menuTitle: varchar("menu_title", { length: 128 }).notNull(),
	createdAt: date("created_at").notNull(),
	editedAt: date("edited_at").notNull(),
}, (table) => [
	index("family_menus_fk").using("btree", table.familyId.asc().nullsLast().op("int4_ops")),
	index("menu_created_at_index").using("btree", table.createdAt.asc().nullsLast().op("date_ops")),
	index("menu_edited_at_index").using("btree", table.editedAt.asc().nullsLast().op("date_ops")),
	uniqueIndex("menus_pk").using("btree", table.menuId.asc().nullsLast().op("int4_ops")),
	index("user_edits_menus_fk").using("btree", table.editUserId.asc().nullsLast().op("int4_ops")),
	index("user_menus_fk").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.familyId],
			foreignColumns: [families.familyId],
			name: "fk_menus_family_me_families"
		}).onUpdate("restrict").onDelete("cascade"),
	foreignKey({
			columns: [table.editUserId],
			foreignColumns: [users.userId],
			name: "fk_menus_user_edit_users"
		}).onUpdate("restrict").onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "fk_menus_user_menu_users"
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
		}).onUpdate("restrict").onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "fk_user_a_m_user_a_me_users"
		}).onUpdate("restrict").onDelete("cascade"),
	primaryKey({ columns: [table.userId, table.familyId], name: "pk_user_a_member_of_families"}),
]);

export const converts = pgTable("converts", {
	fromUnitId: integer("from_unit_id").notNull(),
	toUnitId: integer("to_unit_id").notNull(),
	convertationCoefficient: numeric("convertation_coefficient").notNull(),
}, (table) => [
	index("converts2_fk").using("btree", table.fromUnitId.asc().nullsLast().op("int4_ops")),
	index("converts_fk").using("btree", table.toUnitId.asc().nullsLast().op("int4_ops")),
	uniqueIndex("converts_pk").using("btree", table.fromUnitId.asc().nullsLast().op("int4_ops"), table.toUnitId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.toUnitId],
			foreignColumns: [measurementUnitsRef.measurementUnitId],
			name: "fk_converts_from_unit"
		}).onUpdate("restrict").onDelete("restrict"),
	foreignKey({
			columns: [table.fromUnitId],
			foreignColumns: [measurementUnitsRef.measurementUnitId],
			name: "fk_converts_to_unit"
		}).onUpdate("restrict").onDelete("restrict"),
	primaryKey({ columns: [table.toUnitId, table.fromUnitId], name: "pk_converts"}),
]);

export const mealRecipes = pgTable("meal_recipes", {
	recipeId: integer("recipe_id").notNull(),
	mealId: integer("meal_id").notNull(),
	mealPortions: integer("meal_portions").notNull(),
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

export const productMeasuresInUnits = pgTable("product_measures_in_units", {
	measurementUnitId: integer("measurement_unit_id").notNull(),
	productId: integer("product_id").notNull(),
	productMeasureAmount: numeric("product_measure_amount"),
}, (table) => [
	index("product_measures_in_units2_fk").using("btree", table.productId.asc().nullsLast().op("int4_ops")),
	index("product_measures_in_units_fk").using("btree", table.measurementUnitId.asc().nullsLast().op("int4_ops")),
	uniqueIndex("product_measures_in_units_pk").using("btree", table.measurementUnitId.asc().nullsLast().op("int4_ops"), table.productId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.measurementUnitId],
			foreignColumns: [measurementUnitsRef.measurementUnitId],
			name: "fk_product__product_m_measurem"
		}).onUpdate("restrict").onDelete("restrict"),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.productId],
			name: "fk_product__product_m_products"
		}).onUpdate("restrict").onDelete("cascade"),
	primaryKey({ columns: [table.productId, table.measurementUnitId], name: "pk_product_measures_in_units"}),
]);

export const emissRecords = pgTable("emiss_records", {
	emissGoodsId: integer("emiss_goods_id").notNull(),
	recordDate: date("record_date").notNull(),
	measurementUnitId: integer("measurement_unit_id").notNull(),
	recordPrice: numeric("record_price").notNull(),
}, (table) => [
	index("emiss_good_emiss_records_fk").using("btree", table.emissGoodsId.asc().nullsLast().op("int4_ops")),
	index("emiss_rec_meas_in_unit_fk").using("btree", table.measurementUnitId.asc().nullsLast().op("int4_ops")),
	uniqueIndex("emiss_records_pk").using("btree", table.emissGoodsId.asc().nullsLast().op("date_ops"), table.recordDate.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.emissGoodsId],
			foreignColumns: [emissGoods.emissGoodsId],
			name: "fk_emiss_re_emiss_goo_emiss_go"
		}).onUpdate("restrict").onDelete("cascade"),
	foreignKey({
			columns: [table.measurementUnitId],
			foreignColumns: [measurementUnitsRef.measurementUnitId],
			name: "fk_emiss_re_emiss_rec_measurem"
		}).onUpdate("restrict").onDelete("restrict"),
	primaryKey({ columns: [table.recordDate, table.emissGoodsId], name: "pk_emiss_records"}),
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
export const unitsWithConverts = pgView("units_with_converts", {	measurementUnitId: integer("measurement_unit_id"),
	unitName: varchar("unit_name", { length: 50 }),
	unitAbbr: varchar("unit_abbr", { length: 32 }),
	isStandart: boolean("is_standart"),
	measureType: varchar("measure_type", { length: 32 }),
	fromUnitId: integer("from_unit_id"),
	toUnitId: integer("to_unit_id"),
	convertationCoefficient: numeric("convertation_coefficient"),
}).as(sql`SELECT measurement_units_ref.measurement_unit_id, measurement_units_ref.unit_name, measurement_units_ref.unit_abbr, measurement_units_ref.is_standart, measurement_units_ref.measure_type, converts.from_unit_id, converts.to_unit_id, converts.convertation_coefficient FROM measurement_units_ref JOIN converts ON measurement_units_ref.measurement_unit_id = converts.from_unit_id`);