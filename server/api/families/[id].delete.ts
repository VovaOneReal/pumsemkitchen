import { db } from '~~/server/utils/db'
import { eq, inArray } from 'drizzle-orm'
import {
  families,
  userAMemberOfFamilies,
  invitations,
  recipes,
  products,
  menus,
  shoppingLists,
  planDates,
  meals,
  mealRecipes,
  ingredients,
  recipeSteps,
  listElements,
  shoppingListMenus,
} from '~~/db/schema'

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event)
  const id = Number(getRouterParam(event, 'id'))

  const family = await db.query.families.findFirst({
    where: (f, { eq }) => eq(f.familyId, id),
  })

  if (!family) throw createError({ statusCode: 404, statusMessage: 'Семья не найдена' })
  if (family.ownerUserId !== user.userId) {
    throw createError({ statusCode: 403, statusMessage: 'Только владелец может удалить семью' })
  }

  await db.transaction(async (tx) => {
    // Получаем ID всех связанных сущностей семьи
    const familyRecipes = await tx
      .select({ recipeId: recipes.recipeId })
      .from(recipes)
      .where(eq(recipes.familyId, id))
    const recipeIds = familyRecipes.map((r) => r.recipeId)

    const familyMenus = await tx
      .select({ menuId: menus.menuId })
      .from(menus)
      .where(eq(menus.familyId, id))
    const menuIds = familyMenus.map((m) => m.menuId)

    const familyShoppingLists = await tx
      .select({ shoppingListId: shoppingLists.shoppingListId })
      .from(shoppingLists)
      .where(eq(shoppingLists.familyId, id))
    const shoppingListIds = familyShoppingLists.map((s) => s.shoppingListId)

    // Удаляем зависимости рецептов (ingredients нужно удалить раньше products из-за RESTRICT)
    if (recipeIds.length > 0) {
      await tx.delete(mealRecipes).where(inArray(mealRecipes.recipeId, recipeIds))
      await tx.delete(ingredients).where(inArray(ingredients.recipeId, recipeIds))
      await tx.delete(recipeSteps).where(inArray(recipeSteps.recipeId, recipeIds))
    }

    // Удаляем зависимости меню: планы → приёмы пищи → связки блюд/рецептов
    if (menuIds.length > 0) {
      const familyPlanDates = await tx
        .select({ planDateId: planDates.planDateId })
        .from(planDates)
        .where(inArray(planDates.menuId, menuIds))
      const planDateIds = familyPlanDates.map((p) => p.planDateId)

      if (planDateIds.length > 0) {
        const familyMeals = await tx
          .select({ mealId: meals.mealId })
          .from(meals)
          .where(inArray(meals.planDateId, planDateIds))
        const mealIds = familyMeals.map((m) => m.mealId)

        if (mealIds.length > 0) {
          await tx.delete(mealRecipes).where(inArray(mealRecipes.mealId, mealIds))
          await tx.delete(meals).where(inArray(meals.mealId, mealIds))
        }
        await tx.delete(planDates).where(inArray(planDates.planDateId, planDateIds))
      }

      await tx.delete(shoppingListMenus).where(inArray(shoppingListMenus.menuId, menuIds))
      await tx.delete(menus).where(eq(menus.familyId, id))
    }

    // Удаляем зависимости списков покупок
    if (shoppingListIds.length > 0) {
      await tx.delete(shoppingListMenus).where(inArray(shoppingListMenus.shoppingListId, shoppingListIds))
      await tx.delete(listElements).where(inArray(listElements.shoppingListId, shoppingListIds))
      await tx.delete(shoppingLists).where(eq(shoppingLists.familyId, id))
    }

    // Удаляем рецепты и продукты (ингредиенты уже удалены — нет RESTRICT-блокировки)
    await tx.delete(recipes).where(eq(recipes.familyId, id))
    await tx.delete(products).where(eq(products.familyId, id))

    // Удаляем приглашения и участников
    await tx.delete(invitations).where(eq(invitations.familyId, id))
    await tx.delete(userAMemberOfFamilies).where(eq(userAMemberOfFamilies.familyId, id))

    // Удаляем саму семью
    await tx.delete(families).where(eq(families.familyId, id))
  })

  return { success: true }
})
