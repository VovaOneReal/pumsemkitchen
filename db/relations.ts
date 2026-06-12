import { relations } from "drizzle-orm/relations";
import { families, recipes, users, collections, ingredients, measurementUnitsRef, products, emissGoods, invitations, listElements, shoppingLists, planDates, meals, menus, collectionRecipes, shoppingListMenus, userAMemberOfFamilies, converts, mealRecipes, productMeasuresInUnits, emissRecords, recipeSteps } from "./schema";

export const recipesRelations = relations(recipes, ({one, many}) => ({
	family: one(families, {
		fields: [recipes.familyId],
		references: [families.familyId]
	}),
	user_editUserId: one(users, {
		fields: [recipes.editUserId],
		references: [users.userId],
		relationName: "recipes_editUserId_users_userId"
	}),
	user_userId: one(users, {
		fields: [recipes.userId],
		references: [users.userId],
		relationName: "recipes_userId_users_userId"
	}),
	ingredients: many(ingredients),
	collectionRecipes: many(collectionRecipes),
	mealRecipes: many(mealRecipes),
	recipeSteps: many(recipeSteps),
}));

export const familiesRelations = relations(families, ({one, many}) => ({
	recipes: many(recipes),
	collections: many(collections),
	user: one(users, {
		fields: [families.ownerUserId],
		references: [users.userId]
	}),
	products: many(products),
	invitations: many(invitations),
	shoppingLists: many(shoppingLists),
	menus: many(menus),
	userAMemberOfFamilies: many(userAMemberOfFamilies),
}));

export const usersRelations = relations(users, ({many}) => ({
	recipes_editUserId: many(recipes, {
		relationName: "recipes_editUserId_users_userId"
	}),
	recipes_userId: many(recipes, {
		relationName: "recipes_userId_users_userId"
	}),
	collections_userId: many(collections, {
		relationName: "collections_userId_users_userId"
	}),
	collections_editUserId: many(collections, {
		relationName: "collections_editUserId_users_userId"
	}),
	families: many(families),
	products_editUserId: many(products, {
		relationName: "products_editUserId_users_userId"
	}),
	products_userId: many(products, {
		relationName: "products_userId_users_userId"
	}),
	invitations: many(invitations),
	listElements: many(listElements),
	shoppingLists_editUserId: many(shoppingLists, {
		relationName: "shoppingLists_editUserId_users_userId"
	}),
	shoppingLists_userId: many(shoppingLists, {
		relationName: "shoppingLists_userId_users_userId"
	}),
	menus_editUserId: many(menus, {
		relationName: "menus_editUserId_users_userId"
	}),
	menus_userId: many(menus, {
		relationName: "menus_userId_users_userId"
	}),
	userAMemberOfFamilies: many(userAMemberOfFamilies),
}));

export const collectionsRelations = relations(collections, ({one, many}) => ({
	family: one(families, {
		fields: [collections.familyId],
		references: [families.familyId]
	}),
	user_userId: one(users, {
		fields: [collections.userId],
		references: [users.userId],
		relationName: "collections_userId_users_userId"
	}),
	user_editUserId: one(users, {
		fields: [collections.editUserId],
		references: [users.userId],
		relationName: "collections_editUserId_users_userId"
	}),
	collectionRecipes: many(collectionRecipes),
}));

export const ingredientsRelations = relations(ingredients, ({one}) => ({
	recipe: one(recipes, {
		fields: [ingredients.recipeId],
		references: [recipes.recipeId]
	}),
	measurementUnitsRef: one(measurementUnitsRef, {
		fields: [ingredients.measurementUnitId],
		references: [measurementUnitsRef.measurementUnitId]
	}),
	product: one(products, {
		fields: [ingredients.productId],
		references: [products.productId]
	}),
}));

export const measurementUnitsRefRelations = relations(measurementUnitsRef, ({many}) => ({
	ingredients: many(ingredients),
	products: many(products),
	listElements: many(listElements),
	converts_toUnitId: many(converts, {
		relationName: "converts_toUnitId_measurementUnitsRef_measurementUnitId"
	}),
	converts_fromUnitId: many(converts, {
		relationName: "converts_fromUnitId_measurementUnitsRef_measurementUnitId"
	}),
	productMeasuresInUnits: many(productMeasuresInUnits),
	emissRecords: many(emissRecords),
}));

export const productsRelations = relations(products, ({one, many}) => ({
	ingredients: many(ingredients),
	family: one(families, {
		fields: [products.familyId],
		references: [families.familyId]
	}),
	emissGood: one(emissGoods, {
		fields: [products.emissGoodsId],
		references: [emissGoods.emissGoodsId]
	}),
	measurementUnitsRef: one(measurementUnitsRef, {
		fields: [products.measurementUnitId],
		references: [measurementUnitsRef.measurementUnitId]
	}),
	product_nutritionsFromProductId: one(products, {
		fields: [products.nutritionsFromProductId],
		references: [products.productId],
		relationName: "products_nutritionsFromProductId_products_productId"
	}),
	products_nutritionsFromProductId: many(products, {
		relationName: "products_nutritionsFromProductId_products_productId"
	}),
	product_priceFromProductId: one(products, {
		fields: [products.priceFromProductId],
		references: [products.productId],
		relationName: "products_priceFromProductId_products_productId"
	}),
	products_priceFromProductId: many(products, {
		relationName: "products_priceFromProductId_products_productId"
	}),
	user_editUserId: one(users, {
		fields: [products.editUserId],
		references: [users.userId],
		relationName: "products_editUserId_users_userId"
	}),
	user_userId: one(users, {
		fields: [products.userId],
		references: [users.userId],
		relationName: "products_userId_users_userId"
	}),
	listElements: many(listElements),
	productMeasuresInUnits: many(productMeasuresInUnits),
}));

export const emissGoodsRelations = relations(emissGoods, ({many}) => ({
	products: many(products),
	emissRecords: many(emissRecords),
}));

export const invitationsRelations = relations(invitations, ({one}) => ({
	family: one(families, {
		fields: [invitations.familyId],
		references: [families.familyId]
	}),
	user: one(users, {
		fields: [invitations.userId],
		references: [users.userId]
	}),
}));

export const listElementsRelations = relations(listElements, ({one}) => ({
	measurementUnitsRef: one(measurementUnitsRef, {
		fields: [listElements.measurementUnitId],
		references: [measurementUnitsRef.measurementUnitId]
	}),
	product: one(products, {
		fields: [listElements.productId],
		references: [products.productId]
	}),
	shoppingList: one(shoppingLists, {
		fields: [listElements.shoppingListId],
		references: [shoppingLists.shoppingListId]
	}),
	user: one(users, {
		fields: [listElements.userId],
		references: [users.userId]
	}),
}));

export const shoppingListsRelations = relations(shoppingLists, ({one, many}) => ({
	listElements: many(listElements),
	family: one(families, {
		fields: [shoppingLists.familyId],
		references: [families.familyId]
	}),
	user_editUserId: one(users, {
		fields: [shoppingLists.editUserId],
		references: [users.userId],
		relationName: "shoppingLists_editUserId_users_userId"
	}),
	user_userId: one(users, {
		fields: [shoppingLists.userId],
		references: [users.userId],
		relationName: "shoppingLists_userId_users_userId"
	}),
	shoppingListMenus: many(shoppingListMenus),
}));

export const mealsRelations = relations(meals, ({one, many}) => ({
	planDate: one(planDates, {
		fields: [meals.planDateId],
		references: [planDates.planDateId]
	}),
	mealRecipes: many(mealRecipes),
}));

export const planDatesRelations = relations(planDates, ({one, many}) => ({
	meals: many(meals),
	menu: one(menus, {
		fields: [planDates.menuId],
		references: [menus.menuId]
	}),
}));

export const menusRelations = relations(menus, ({one, many}) => ({
	planDates: many(planDates),
	family: one(families, {
		fields: [menus.familyId],
		references: [families.familyId]
	}),
	user_editUserId: one(users, {
		fields: [menus.editUserId],
		references: [users.userId],
		relationName: "menus_editUserId_users_userId"
	}),
	user_userId: one(users, {
		fields: [menus.userId],
		references: [users.userId],
		relationName: "menus_userId_users_userId"
	}),
	shoppingListMenus: many(shoppingListMenus),
}));

export const collectionRecipesRelations = relations(collectionRecipes, ({one}) => ({
	recipe: one(recipes, {
		fields: [collectionRecipes.recipeId],
		references: [recipes.recipeId]
	}),
	collection: one(collections, {
		fields: [collectionRecipes.collectionId],
		references: [collections.collectionId]
	}),
}));

export const shoppingListMenusRelations = relations(shoppingListMenus, ({one}) => ({
	menu: one(menus, {
		fields: [shoppingListMenus.menuId],
		references: [menus.menuId]
	}),
	shoppingList: one(shoppingLists, {
		fields: [shoppingListMenus.shoppingListId],
		references: [shoppingLists.shoppingListId]
	}),
}));

export const userAMemberOfFamiliesRelations = relations(userAMemberOfFamilies, ({one}) => ({
	family: one(families, {
		fields: [userAMemberOfFamilies.familyId],
		references: [families.familyId]
	}),
	user: one(users, {
		fields: [userAMemberOfFamilies.userId],
		references: [users.userId]
	}),
}));

export const convertsRelations = relations(converts, ({one}) => ({
	measurementUnitsRef_toUnitId: one(measurementUnitsRef, {
		fields: [converts.toUnitId],
		references: [measurementUnitsRef.measurementUnitId],
		relationName: "converts_toUnitId_measurementUnitsRef_measurementUnitId"
	}),
	measurementUnitsRef_fromUnitId: one(measurementUnitsRef, {
		fields: [converts.fromUnitId],
		references: [measurementUnitsRef.measurementUnitId],
		relationName: "converts_fromUnitId_measurementUnitsRef_measurementUnitId"
	}),
}));

export const mealRecipesRelations = relations(mealRecipes, ({one}) => ({
	recipe: one(recipes, {
		fields: [mealRecipes.recipeId],
		references: [recipes.recipeId]
	}),
	meal: one(meals, {
		fields: [mealRecipes.mealId],
		references: [meals.mealId]
	}),
}));

export const productMeasuresInUnitsRelations = relations(productMeasuresInUnits, ({one}) => ({
	measurementUnitsRef: one(measurementUnitsRef, {
		fields: [productMeasuresInUnits.measurementUnitId],
		references: [measurementUnitsRef.measurementUnitId]
	}),
	product: one(products, {
		fields: [productMeasuresInUnits.productId],
		references: [products.productId]
	}),
}));

export const emissRecordsRelations = relations(emissRecords, ({one}) => ({
	emissGood: one(emissGoods, {
		fields: [emissRecords.emissGoodsId],
		references: [emissGoods.emissGoodsId]
	}),
	measurementUnitsRef: one(measurementUnitsRef, {
		fields: [emissRecords.measurementUnitId],
		references: [measurementUnitsRef.measurementUnitId]
	}),
}));

export const recipeStepsRelations = relations(recipeSteps, ({one}) => ({
	recipe: one(recipes, {
		fields: [recipeSteps.recipeId],
		references: [recipes.recipeId]
	}),
}));