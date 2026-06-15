import { db } from '~~/server/utils/db'
import { recipes, ingredients as ingredientsTable, recipeSteps } from '~~/db/schema'
import { eq } from 'drizzle-orm'
import { updateRecipeSchema } from '~~/schemas/recipe'

export default defineEventHandler(async (event) => {
  // Сессия гарантирована server/middleware/auth.ts
  const { user } = await getUserSession(event)
  const id = Number(getRouterParam(event, 'id'))
  const body = await readValidatedBody(event, updateRecipeSchema.parseAsync)
  const today = new Date().toISOString().slice(0, 10)

  const existing = await db.query.recipes.findFirst({
    where: (r, { eq }) => eq(r.recipeId, id),
  })

  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Рецепт не найден' })
  if (existing.userId !== user.userId) throw createError({ statusCode: 403, statusMessage: 'Нет доступа к рецепту' })

  await db.transaction(async (tx) => {
    // Обновляем только переданные поля рецепта
    await tx.update(recipes).set({
      ...(body.title !== undefined && { title: body.title }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.cooking_time_min !== undefined && { cookingTimeMin: body.cooking_time_min }),
      ...(body.portions !== undefined && { portions: body.portions }),
      ...(body.is_public !== undefined && { isPublic: body.is_public }),
      ...(body.picture_url !== undefined && { pictureUrl: body.picture_url }),
      ...(body.source_url !== undefined && { sourceUrl: body.source_url }),
      editedAt: today,
      editUserId: user.userId,
    }).where(eq(recipes.recipeId, id))

    if (body.ingredients !== undefined) {
      await tx.delete(ingredientsTable).where(eq(ingredientsTable.recipeId, id))

      if (body.ingredients.length) {
        await tx.insert(ingredientsTable).values(
          body.ingredients.map((ing) => ({
            recipeId: id,
            productId: ing.product_id,
            measurementUnitId: ing.measurement_unit_id,
            quantity: String(ing.quantity),
            isOptional: ing.is_optional ?? false,
            note: ing.note ?? null,
          }))
        )
      }
    }

    if (body.steps !== undefined) {
      await tx.delete(recipeSteps).where(eq(recipeSteps.recipeId, id))

      if (body.steps.length) {
        await tx.insert(recipeSteps).values(
          body.steps.map((s) => ({
            recipeId: id,
            order: String(s.order),
            description: s.description,
            pictureUrl: s.picture_url ?? null,
          }))
        )
      }
    }
  })

  const row = await db.query.recipes.findFirst({
    where: (r, { eq }) => eq(r.recipeId, id),
    with: {
      user_userId: true,
      ingredients: { with: { product: true, measurementUnitsRef: true } },
      recipeSteps: true,
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
    sourceUrl: row!.sourceUrl,
    createdAt: row!.createdAt,
    editedAt: row!.editedAt,
    authorName: row!.user_userId.name,
    ingredients: row!.ingredients.map((ing) => ({
      id: ing.ingredientId,
      productId: ing.product.productId,
      name: ing.product.title,
      note: ing.note,
      isOptional: ing.isOptional,
      amount: Number(ing.quantity),
      measurementUnitId: ing.measurementUnitsRef.measurementUnitId,
      amountType: ing.measurementUnitsRef.unitName,
    })),
    steps: row!.recipeSteps.map((s) => ({
      step: Number(s.order),
      description: s.description,
      pictureUrl: s.pictureUrl,
    })),
  }
})
