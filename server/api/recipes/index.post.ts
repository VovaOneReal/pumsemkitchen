import { db } from '~~/server/utils/db'
import { recipes, ingredients as ingredientsTable, recipeSteps } from '~~/db/schema'
import { createRecipeSchema } from '~~/schemas/recipe'

export default defineEventHandler(async (event) => {
  // Сессия гарантирована server/middleware/auth.ts
  const { user } = await getUserSession(event)
  const body = await readValidatedBody(event, createRecipeSchema.parseAsync)
  const today = new Date().toISOString().slice(0, 10)

  const recipe = await db.transaction(async (tx) => {
    const [created] = await tx.insert(recipes).values({
      userId: user.userId,
      title: body.title,
      description: body.description ?? null,
      cookingTimeMin: body.cooking_time_min ?? null,
      portions: body.portions ?? 4,
      isPublic: body.is_public ?? false,
      pictureUrl: body.picture_url ?? null,
      createdAt: today,
      editedAt: today,
    }).returning()

    if (body.ingredients?.length) {
      await tx.insert(ingredientsTable).values(
        body.ingredients.map((ing) => ({
          recipeId: created.recipeId,
          productId: ing.product_id,
          measurementUnitId: ing.measurement_unit_id,
          quantity: String(ing.quantity),
          isOptional: ing.is_optional ?? false,
          note: ing.note ?? null,
        }))
      )
    }

    if (body.steps?.length) {
      await tx.insert(recipeSteps).values(
        body.steps.map((s) => ({
          recipeId: created.recipeId,
          order: String(s.order),
          description: s.description,
          pictureUrl: s.picture_url ?? null,
        }))
      )
    }

    return created
  })

  const row = await db.query.recipes.findFirst({
    where: (r, { eq }) => eq(r.recipeId, recipe.recipeId),
    with: {
      user: true,
      ingredients: { with: { product: true, measurementUnit: true } },
      steps: true,
    },
  })

  return {
    id: row!.recipeId,
    title: row!.title,
    description: row!.description,
    cookingTimeMin: row!.cookingTimeMin,
    portions: row!.portions,
    isPublic: row!.isPublic,
    pictureUrl: row!.pictureUrl,
    createdAt: row!.createdAt,
    editedAt: row!.editedAt,
    authorName: row!.user.name,
    ingredients: row!.ingredients.map((ing) => ({
      id: ing.ingredientId,
      name: ing.product.title,
      note: ing.note,
      isOptional: ing.isOptional,
      amount: Number(ing.quantity),
      amountType: ing.measurementUnit.unitName,
    })),
    steps: row!.steps.map((s) => ({
      step: Number(s.order),
      description: s.description,
      pictureUrl: s.pictureUrl,
    })),
  }
})
