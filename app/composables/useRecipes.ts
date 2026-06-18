import type { Recipe, RecipeDetail } from '@/types'
import type { CreateRecipeForm, UpdateRecipeForm } from '~~/schemas/recipe'

export const useRecipes = () => {
  const recipes = useState<Recipe[]>('recipes', () => [])
  const loading = ref(false)

  const currentRecipe = useState<RecipeDetail | null>('currentRecipe', () => null)
  const detailLoading = ref(false)

  const workspaceStore = useWorkspaceStore()

  const fetchRecipes = async () => {
    loading.value = true
    try {
      const query = workspaceStore.activeFamilyId ? { familyId: workspaceStore.activeFamilyId } : {}
      recipes.value = await $fetch<Recipe[]>('/api/recipes', { query })
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
    return await $fetch('/api/recipes', {
      method: 'POST',
      body: { ...body, family_id: workspaceStore.activeFamilyId ?? undefined },
    })
  }

  const updateRecipe = async (id: number, body: UpdateRecipeForm) => {
    const updated = await $fetch<RecipeDetail>(`/api/recipes/${id}`, { method: 'PATCH', body })
    currentRecipe.value = updated
    return updated
  }

  const deleteRecipe = async (id: number) => {
    await $fetch(`/api/recipes/${id}`, { method: 'DELETE' })
    recipes.value = recipes.value.filter((r) => r.id !== id)
  }

  return { recipes, loading, fetchRecipes, currentRecipe, detailLoading, fetchRecipeById, createRecipe, updateRecipe, deleteRecipe }
}
