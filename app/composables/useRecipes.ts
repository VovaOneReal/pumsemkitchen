import type { Recipe } from '@/types'

export const useRecipes = () => {
  const recipes = useState<Recipe[]>('recipes', () => [])
  const loading = ref(false)

  const fetchRecipes = async () => {
    loading.value = true
    try {
      recipes.value = await $fetch<Recipe[]>('/api/recipes')
    } finally {
      loading.value = false
    }
  }

  return { recipes, loading, fetchRecipes }
}
