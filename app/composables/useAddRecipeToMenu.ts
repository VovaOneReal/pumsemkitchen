import type { Menu, PlanDate, MealWithRecipes } from '~~/app/types'

type SelectItem = { label: string; value: number | string }

export const useAddRecipeToMenu = () => {
  const menus = ref<Menu[]>([])
  const planDates = ref<PlanDate[]>([])
  const meals = ref<MealWithRecipes[]>([])

  const loadingMenus = ref(false)
  const loadingDates = ref(false)
  const loadingMeals = ref(false)

  const menuItems = computed<SelectItem[]>(() =>
    menus.value.map((m) => ({ label: m.title, value: m.id })),
  )

  const planDateItems = computed<SelectItem[]>(() =>
    planDates.value.map((pd) => ({
      label: new Date(pd.planDate).toLocaleDateString('ru-RU', {
        weekday: 'short',
        day: 'numeric',
        month: 'long',
      }),
      value: pd.planDate,
    })),
  )

  const mealItems = computed<SelectItem[]>(() =>
    meals.value.map((m) => ({ label: m.mealTitle, value: m.mealId })),
  )

  const workspaceStore = useWorkspaceStore()

  const fetchMenus = async () => {
    loadingMenus.value = true
    try {
      const query = workspaceStore.activeFamilyId ? { familyId: workspaceStore.activeFamilyId } : {}
      menus.value = await $fetch<Menu[]>('/api/menus', { query })
    } finally {
      loadingMenus.value = false
    }
  }

  const fetchPlanDates = async (menuId: number) => {
    loadingDates.value = true
    try {
      const data = await $fetch<{ menuTitle: string; planDates: PlanDate[] }>(`/api/menus/${menuId}/plan-dates`)
      planDates.value = data.planDates
    } finally {
      loadingDates.value = false
    }
  }

  const fetchMeals = async (menuId: number, date: string) => {
    loadingMeals.value = true
    try {
      const data = await $fetch<{ menuTitle: string; planDate: string; meals: MealWithRecipes[] }>(
        `/api/menus/${menuId}/days/${date}`,
      )
      meals.value = data.meals
    } finally {
      loadingMeals.value = false
    }
  }

  // Возвращает 'added' при успехе, 'duplicate' если рецепт уже есть
  const addRecipeToMeal = async (
    mealId: number,
    recipeId: number,
    portions: number,
  ): Promise<'added' | 'duplicate'> => {
    try {
      await $fetch(`/api/meals/${mealId}/recipes`, {
        method: 'POST',
        body: { recipeId, portions },
      })
      return 'added'
    } catch (err: unknown) {
      if ((err as { statusCode?: number }).statusCode === 409) return 'duplicate'
      throw err
    }
  }

  const reset = () => {
    menus.value = []
    planDates.value = []
    meals.value = []
  }

  return {
    menuItems,
    planDateItems,
    mealItems,
    loadingMenus,
    loadingDates,
    loadingMeals,
    fetchMenus,
    fetchPlanDates,
    fetchMeals,
    addRecipeToMeal,
    reset,
  }
}
