import { db } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  // Сессия гарантирована server/middleware/auth.ts
  const { user } = await getUserSession(event)
  const id = Number(getRouterParam(event, 'id'))

  const recipe = await db.query.recipes.findFirst({
    where: (r, { eq }) => eq(r.recipeId, id),
    with: {
      user_userId: true,
      ingredients: {
        with: { product: true, measurementUnitsRef: true },
      },
      recipeSteps: true,
    },
  })

  if (!recipe) throw createError({ statusCode: 404, statusMessage: 'Рецепт не найден' })
  if (recipe.userId !== user.userId) throw createError({ statusCode: 403, statusMessage: 'Нет доступа к рецепту' })

  return {
    id: recipe.recipeId,
    title: recipe.title,
    description: recipe.description,
    cookingTimeMin: recipe.cookingTimeMin,
    portions: recipe.portions,
    isPublic: recipe.isPublic,
    pictureUrl: recipe.pictureUrl,
    sourceUrl: recipe.sourceUrl,
    createdAt: recipe.createdAt,
    editedAt: recipe.editedAt,
    authorName: recipe.user_userId.name,
    ingredients: recipe.ingredients.map((ing) => ({
      id: ing.ingredientId,
      productId: ing.product.productId,
      name: ing.product.title,
      note: ing.note,
      isOptional: ing.isOptional,
      amount: Number(ing.quantity),
      measurementUnitId: ing.measurementUnitsRef.measurementUnitId,
      amountType: ing.measurementUnitsRef.unitName,
    })),
    steps: recipe.recipeSteps.map((s) => ({
      step: Number(s.order),
      description: s.description,
      pictureUrl: s.pictureUrl,
    })),
  }
})
