import { relations } from "drizzle-orm/relations";
import { users, families, recipes, ingredients, measurementUnitsRef, products, emissGoods, invitations, shoppingLists, listElements, planDates, meals, menus, shoppingListMenus, userAMemberOfFamilies, converts, mealRecipes, emissRecords, recipeSteps } from "./schema";

export const familiesRelations = relations(families, ({one, many}) => ({
	user: one(users, {
		fields: [families.ownerUserId],
		references: [users.userId]
	}),
	recipes: many(recipes),
	products: many(products),
	invitations: many(invitations),
	shoppingLists: many(shoppingLists),
	menus: many(menus),
	userAMemberOfFamilies: many(userAMemberOfFamilies),
}));

export const usersRelations = relations(users, ({many}) => ({
	families: many(families),
	recipes_editUserId: many(recipes, {
		relationName: "recipes_editUserId_users_userId"
	}),
	recipes_userId: many(recipes, {
		relationName: "recipes_userId_users_userId"
	}),
	products_editUserId: many(products, {
		relationName: "products_editUserId_users_userId"
	}),
	products_userId: many(products, {
		relationName: "products_userId_users_userId"
	}),
	invitations: many(invitations),
	shoppingLists_editUserId: many(shoppingLists, {
		relationName: "shoppingLists_editUserId_users_userId"
	}),
	shoppingLists_userId: many(shoppingLists, {
		relationName: "shoppingLists_userId_users_userId"
	}),
	listElements: many(listElements),
	menus_editUserId: many(menus, {
		relationName: "menus_editUserId_users_userId"
	}),
	menus_userId: many(menus, {
		relationName: "menus_userId_users_userId"
	}),
	userAMemberOfFamilies: many(userAMemberOfFamilies),
}));

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
	mealRecipes: many(mealRecipes),
	recipeSteps: many(recipeSteps),
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
	converts_fromUnitId: many(converts, {
		relationName: "converts_fromUnitId_measurementUnitsRef_measurementUnitId"
	}),
	converts_toUnitId: many(converts, {
		relationName: "converts_toUnitId_measurementUnitsRef_measurementUnitId"
	}),
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

export const shoppingListsRelations = relations(shoppingLists, ({one, many}) => ({
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
	listElements: many(listElements),
	shoppingListMenus: many(shoppingListMenus),
}));

export const listElementsRelations = relations(listElements, ({one}) => ({
	shoppingList: one(shoppingLists, {
		fields: [listElements.shoppingListId],
		references: [shoppingLists.shoppingListId]
	}),
	user: one(users, {
		fields: [listElements.userId],
		references: [users.userId]
	}),
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
	measurementUnitsRef_fromUnitId: one(measurementUnitsRef, {
		fields: [converts.fromUnitId],
		references: [measurementUnitsRef.measurementUnitId],
		relationName: "converts_fromUnitId_measurementUnitsRef_measurementUnitId"
	}),
	measurementUnitsRef_toUnitId: one(measurementUnitsRef, {
		fields: [converts.toUnitId],
		references: [measurementUnitsRef.measurementUnitId],
		relationName: "converts_toUnitId_measurementUnitsRef_measurementUnitId"
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