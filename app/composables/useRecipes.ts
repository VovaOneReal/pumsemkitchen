import type { Recipe, RecipeDetail } from '@/types'
import type { CreateRecipeForm } from '~~/schemas/recipe'

export const useRecipes = () => {
  const recipes = useState<Recipe[]>('recipes', () => [])
  const loading = ref(false)

  const currentRecipe = useState<RecipeDetail | null>('currentRecipe', () => null)
  const detailLoading = ref(false)

  const fetchRecipes = async () => {
    loading.value = true
    try {
      recipes.value = await $fetch<Recipe[]>('/api/recipes')
    } finally {
      loading.value = false
    }
  }

  const fetchRecipeById = async (id: number) => {
    detailLoading.value = true
    currentRecipe.value = null
    try {
      currentRecipe.value = await $fetch<RecipeDetail>(`/api/recipes/${id}`)
    } finally {
      detailLoading.value = false
    }
  }

  const createRecipe = async (body: CreateRecipeForm) => {
    return await $fetch('/api/recipes', { method: 'POST', body })
  }

  return { recipes, loading, fetchRecipes, currentRecipe, detailLoading, fetchRecipeById, createRecipe }
}
