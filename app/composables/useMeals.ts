import type { DayDetail, NutritionValues } from '~~/app/types'
import { calcMealNutrition, calcDayNutrition } from '~/composables/useNutritionCalc'

export const useMeals = (menuId: Ref<number>, date: Ref<string>) => {
  const dayDetail = useState<DayDetail | null>(`day-${menuId.value}-${date.value}`, () => null)
  const loading = ref(false)

  const fetchDay = async () => {
    loading.value = true
    try {
      dayDetail.value = await $fetch<DayDetail>(`/api/menus/${menuId.value}/days/${date.value}`)
    } finally {
      loading.value = false
    }
  }

  const updatePortions = async (mealId: number, recipeId: number, portions: number) => {
    await $fetch(`/api/meals/${mealId}/recipes/${recipeId}`, {
      method: 'PATCH',
      body: { portions },
    })
    const meal = dayDetail.value?.meals.find((m) => m.mealId === mealId)
    const recipe = meal?.recipes.find((r) => r.recipeId === recipeId)
    // Мутация portions — Vue реактивно пересчитает mealsNutrition и dayNutrition
    if (recipe) recipe.portions = portions
  }

  const deleteRecipe = async (mealId: number, recipeId: number) => {
    await $fetch(`/api/meals/${mealId}/recipes/${recipeId}`, { method: 'DELETE' })
    const meal = dayDetail.value?.meals.find((m) => m.mealId === mealId)
    if (meal) meal.recipes = meal.recipes.filter((r) => r.recipeId !== recipeId)
  }

  // КБЖУ каждого приёма пищи — индекс совпадает с dayDetail.meals
  const mealsNutrition = computed<NutritionValues[]>(() =>
    (dayDetail.value?.meals ?? []).map(m => calcMealNutrition(m.recipes)),
  )

  // КБЖУ всего дня
  const dayNutrition = computed<NutritionValues>(() =>
    calcDayNutrition(dayDetail.value?.meals ?? []),
  )

  const addRecipe = async (mealId: number, recipeId: number, portions: number) => {
    await $fetch(`/api/meals/${mealId}/recipes`, {
      method: 'POST',
      body: { recipeId, portions },
    })
    // Перезагружаем день, чтобы получить свежий nutritionPerPortion с сервера
    await fetchDay()
  }

  return { dayDetail, loading, fetchDay, updatePortions, deleteRecipe, addRecipe, mealsNutrition, dayNutrition }
}
