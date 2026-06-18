import type { NutritionValues, MealRecipeItem, MealWithRecipes } from '~~/app/types'

function zeroNutrition(): NutritionValues {
  return { proteins: 0, fats: 0, carbs: 0, calories: 0, cost: 0 }
}

function sumNutrition(items: NutritionValues[]): NutritionValues {
  return items.reduce(
    (acc, n) => ({
      proteins: acc.proteins + n.proteins,
      fats: acc.fats + n.fats,
      carbs: acc.carbs + n.carbs,
      calories: acc.calories + n.calories,
      cost: acc.cost + n.cost,
    }),
    zeroNutrition(),
  )
}

// Итого по приёму пищи: сумма nutritionPerPortion * portions для каждого рецепта
export function calcMealNutrition(recipes: MealRecipeItem[]): NutritionValues {
  return sumNutrition(
    recipes.map(r => ({
      proteins: r.nutritionPerPortion.proteins * r.portions,
      fats: r.nutritionPerPortion.fats * r.portions,
      carbs: r.nutritionPerPortion.carbs * r.portions,
      calories: r.nutritionPerPortion.calories * r.portions,
      cost: r.nutritionPerPortion.cost * r.portions,
    })),
  )
}

// Итого по дню: сумма всех приёмов пищи
export function calcDayNutrition(meals: MealWithRecipes[]): NutritionValues {
  return sumNutrition(meals.map(m => calcMealNutrition(m.recipes)))
}
