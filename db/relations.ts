import { relations } from 'drizzle-orm'
import {
  users,
  recipes,
  collections,
  products,
  measurementUnits,
  convertationCoefficients,
  emissGoods,
  emissRecords,
  fdcFood,
  fdcRecords,
  families,
  invitations,
  menus,
  planDates,
  meals,
  shoppingLists,
  listElements,
  ingredients,
  recipeSteps,
  grades,
  collectionRecipes,
  mealRecipes,
  shoppingListMenus,
  userAMemberOfFamilies,
  familyCollectionsAccess,
  familyMenusAccess,
  familyProductsAccess,
  familyRecipesAccess,
  familyShoppingListsAccess,
} from './schema'

export const usersRelations = relations(users, ({ many }) => ({
  recipes: many(recipes, { relationName: 'userRecipes' }),
  editedRecipes: many(recipes, { relationName: 'userEditsRecipes' }),
  collections: many(collections, { relationName: 'userCollections' }),
  editedCollections: many(collections, { relationName: 'userEditsCollections' }),
  products: many(products, { relationName: 'userProducts' }),
  editedProducts: many(products, { relationName: 'userEditsProducts' }),
  menus: many(menus, { relationName: 'userMenus' }),
  editedMenus: many(menus, { relationName: 'userEditsMenus' }),
  shoppingLists: many(shoppingLists, { relationName: 'userShoppingLists' }),
  editedShoppingLists: many(shoppingLists, { relationName: 'userEditsShoppingLists' }),
  grades: many(grades),
  families: many(families),
  invitations: many(invitations),
  listElements: many(listElements),
  memberOfFamilies: many(userAMemberOfFamilies),
}))

export const recipesRelations = relations(recipes, ({ one, many }) => ({
  user: one(users, {
    fields: [recipes.userId],
    references: [users.userId],
    relationName: 'userRecipes',
  }),
  editedByUser: one(users, {
    fields: [recipes.editedByUserId],
    references: [users.userId],
    relationName: 'userEditsRecipes',
  }),
  ingredients: many(ingredients),
  steps: many(recipeSteps),
  grades: many(grades),
  collectionRecipes: many(collectionRecipes),
  mealRecipes: many(mealRecipes),
  familyAccess: many(familyRecipesAccess),
}))

export const collectionsRelations = relations(collections, ({ one, many }) => ({
  user: one(users, {
    fields: [collections.userId],
    references: [users.userId],
    relationName: 'userCollections',
  }),
  editedByUser: one(users, {
    fields: [collections.editedByUserId],
    references: [users.userId],
    relationName: 'userEditsCollections',
  }),
  collectionRecipes: many(collectionRecipes),
  familyAccess: many(familyCollectionsAccess),
}))

export const productsRelations = relations(products, ({ one, many }) => ({
  user: one(users, {
    fields: [products.userId],
    references: [users.userId],
    relationName: 'userProducts',
  }),
  editedByUser: one(users, {
    fields: [products.editedByUserId],
    references: [users.userId],
    relationName: 'userEditsProducts',
  }),
  measurementUnit: one(measurementUnits, {
    fields: [products.measurementUnitId],
    references: [measurementUnits.measurementUnitId],
  }),
  emissGoods: one(emissGoods, {
    fields: [products.emissGoodsId],
    references: [emissGoods.emissGoodsId],
  }),
  fdcFood: one(fdcFood, {
    fields: [products.fdcId],
    references: [fdcFood.fdcId],
  }),
  ingredients: many(ingredients),
  listElements: many(listElements),
  familyAccess: many(familyProductsAccess),
}))

export const measurementUnitsRelations = relations(measurementUnits, ({ many }) => ({
  products: many(products),
  ingredients: many(ingredients),
  listElements: many(listElements),
  convertationFrom: many(convertationCoefficients, { relationName: 'fromMeasurementUnit' }),
  convertationTo: many(convertationCoefficients, { relationName: 'toMeasurementUnit' }),
}))

export const convertationCoefficientsRelations = relations(convertationCoefficients, ({ one }) => ({
  fromUnit: one(measurementUnits, {
    fields: [convertationCoefficients.measurementUnitFromId],
    references: [measurementUnits.measurementUnitId],
    relationName: 'fromMeasurementUnit',
  }),
  toUnit: one(measurementUnits, {
    fields: [convertationCoefficients.measurementUnitToId],
    references: [measurementUnits.measurementUnitId],
    relationName: 'toMeasurementUnit',
  }),
}))

export const emissGoodsRelations = relations(emissGoods, ({ many }) => ({
  records: many(emissRecords),
  products: many(products),
}))

export const emissRecordsRelations = relations(emissRecords, ({ one }) => ({
  goods: one(emissGoods, {
    fields: [emissRecords.emissGoodsId],
    references: [emissGoods.emissGoodsId],
  }),
}))

export const fdcFoodRelations = relations(fdcFood, ({ many }) => ({
  records: many(fdcRecords),
  products: many(products),
}))

export const fdcRecordsRelations = relations(fdcRecords, ({ one }) => ({
  food: one(fdcFood, {
    fields: [fdcRecords.fdcId],
    references: [fdcFood.fdcId],
  }),
}))

export const familiesRelations = relations(families, ({ one, many }) => ({
  owner: one(users, {
    fields: [families.userId],
    references: [users.userId],
  }),
  invitations: many(invitations),
  members: many(userAMemberOfFamilies),
  collectionsAccess: many(familyCollectionsAccess),
  menusAccess: many(familyMenusAccess),
  productsAccess: many(familyProductsAccess),
  recipesAccess: many(familyRecipesAccess),
  shoppingListsAccess: many(familyShoppingListsAccess),
}))

export const invitationsRelations = relations(invitations, ({ one }) => ({
  family: one(families, {
    fields: [invitations.familyId],
    references: [families.familyId],
  }),
  user: one(users, {
    fields: [invitations.userId],
    references: [users.userId],
  }),
}))

export const menusRelations = relations(menus, ({ one, many }) => ({
  user: one(users, {
    fields: [menus.userId],
    references: [users.userId],
    relationName: 'userMenus',
  }),
  editedByUser: one(users, {
    fields: [menus.editedByUserId],
    references: [users.userId],
    relationName: 'userEditsMenus',
  }),
  planDates: many(planDates),
  shoppingListMenus: many(shoppingListMenus),
  familyAccess: many(familyMenusAccess),
}))

export const planDatesRelations = relations(planDates, ({ one, many }) => ({
  menu: one(menus, {
    fields: [planDates.menuId],
    references: [menus.menuId],
  }),
  meals: many(meals),
}))

export const mealsRelations = relations(meals, ({ one, many }) => ({
  planDate: one(planDates, {
    fields: [meals.planDateId],
    references: [planDates.planDateId],
  }),
  mealRecipes: many(mealRecipes),
  listElements: many(listElements),
}))

export const shoppingListsRelations = relations(shoppingLists, ({ one, many }) => ({
  user: one(users, {
    fields: [shoppingLists.userId],
    references: [users.userId],
    relationName: 'userShoppingLists',
  }),
  editedByUser: one(users, {
    fields: [shoppingLists.editedByUserId],
    references: [users.userId],
    relationName: 'userEditsShoppingLists',
  }),
  listElements: many(listElements),
  shoppingListMenus: many(shoppingListMenus),
  familyAccess: many(familyShoppingListsAccess),
}))

export const listElementsRelations = relations(listElements, ({ one }) => ({
  shoppingList: one(shoppingLists, {
    fields: [listElements.shoppingListId],
    references: [shoppingLists.shoppingListId],
  }),
  product: one(products, {
    fields: [listElements.productId],
    references: [products.productId],
  }),
  meal: one(meals, {
    fields: [listElements.mealId],
    references: [meals.mealId],
  }),
  measurementUnit: one(measurementUnits, {
    fields: [listElements.measurementUnitId],
    references: [measurementUnits.measurementUnitId],
  }),
  user: one(users, {
    fields: [listElements.userId],
    references: [users.userId],
  }),
}))

export const ingredientsRelations = relations(ingredients, ({ one }) => ({
  recipe: one(recipes, {
    fields: [ingredients.recipeId],
    references: [recipes.recipeId],
  }),
  product: one(products, {
    fields: [ingredients.productId],
    references: [products.productId],
  }),
  measurementUnit: one(measurementUnits, {
    fields: [ingredients.measurementUnitId],
    references: [measurementUnits.measurementUnitId],
  }),
}))

export const recipeStepsRelations = relations(recipeSteps, ({ one }) => ({
  recipe: one(recipes, {
    fields: [recipeSteps.recipeId],
    references: [recipes.recipeId],
  }),
}))

export const gradesRelations = relations(grades, ({ one }) => ({
  user: one(users, {
    fields: [grades.userId],
    references: [users.userId],
  }),
  recipe: one(recipes, {
    fields: [grades.recipeId],
    references: [recipes.recipeId],
  }),
}))

// Связующие таблицы

export const collectionRecipesRelations = relations(collectionRecipes, ({ one }) => ({
  recipe: one(recipes, {
    fields: [collectionRecipes.recipeId],
    references: [recipes.recipeId],
  }),
  collection: one(collections, {
    fields: [collectionRecipes.collectionId],
    references: [collections.collectionId],
  }),
}))

export const mealRecipesRelations = relations(mealRecipes, ({ one }) => ({
  recipe: one(recipes, {
    fields: [mealRecipes.recipeId],
    references: [recipes.recipeId],
  }),
  meal: one(meals, {
    fields: [mealRecipes.mealId],
    references: [meals.mealId],
  }),
}))

export const shoppingListMenusRelations = relations(shoppingListMenus, ({ one }) => ({
  menu: one(menus, {
    fields: [shoppingListMenus.menuId],
    references: [menus.menuId],
  }),
  shoppingList: one(shoppingLists, {
    fields: [shoppingListMenus.shoppingListId],
    references: [shoppingLists.shoppingListId],
  }),
}))

export const userAMemberOfFamiliesRelations = relations(userAMemberOfFamilies, ({ one }) => ({
  family: one(families, {
    fields: [userAMemberOfFamilies.familyId],
    references: [families.familyId],
  }),
  user: one(users, {
    fields: [userAMemberOfFamilies.userId],
    references: [users.userId],
  }),
}))

export const familyCollectionsAccessRelations = relations(familyCollectionsAccess, ({ one }) => ({
  family: one(families, {
    fields: [familyCollectionsAccess.familyId],
    references: [families.familyId],
  }),
  collection: one(collections, {
    fields: [familyCollectionsAccess.collectionId],
    references: [collections.collectionId],
  }),
}))

export const familyMenusAccessRelations = relations(familyMenusAccess, ({ one }) => ({
  family: one(families, {
    fields: [familyMenusAccess.familyId],
    references: [families.familyId],
  }),
  menu: one(menus, {
    fields: [familyMenusAccess.menuId],
    references: [menus.menuId],
  }),
}))

export const familyProductsAccessRelations = relations(familyProductsAccess, ({ one }) => ({
  family: one(families, {
    fields: [familyProductsAccess.familyId],
    references: [families.familyId],
  }),
  product: one(products, {
    fields: [familyProductsAccess.productId],
    references: [products.productId],
  }),
}))

export const familyRecipesAccessRelations = relations(familyRecipesAccess, ({ one }) => ({
  family: one(families, {
    fields: [familyRecipesAccess.familyId],
    references: [families.familyId],
  }),
  recipe: one(recipes, {
    fields: [familyRecipesAccess.recipeId],
    references: [recipes.recipeId],
  }),
}))

export const familyShoppingListsAccessRelations = relations(familyShoppingListsAccess, ({ one }) => ({
  family: one(families, {
    fields: [familyShoppingListsAccess.familyId],
    references: [families.familyId],
  }),
  shoppingList: one(shoppingLists, {
    fields: [familyShoppingListsAccess.shoppingListId],
    references: [shoppingLists.shoppingListId],
  }),
}))
