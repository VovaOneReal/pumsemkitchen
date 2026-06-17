import type { DayDetail } from '~~/app/types'

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
    if (recipe) recipe.portions = portions
  }

  const deleteRecipe = async (mealId: number, recipeId: number) => {
    await $fetch(`/api/meals/${mealId}/recipes/${recipeId}`, { method: 'DELETE' })
    const meal = dayDetail.value?.meals.find((m) => m.mealId === mealId)
    if (meal) meal.recipes = meal.recipes.filter((r) => r.recipeId !== recipeId)
  }

  return { dayDetail, loading, fetchDay, updatePortions, deleteRecipe }
}
