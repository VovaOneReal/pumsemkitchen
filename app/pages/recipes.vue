<template>
  <div class="flex flex-col w-full px-2">
    <div v-if="$route.path == '/recipes'" class="flex flex-col w-full gap-4">
      <div class="flex items-center justify-between w-full">
        <h2 class="ui-header-2">Рецепты</h2>
        <UButton label="+ Создать" @click="onCreate" />
      </div>
      <div class="flex gap-2 items-center">
        <UInput
          v-model="searchQuery"
          placeholder="Название..."
          class="w-64"
          :trailing-icon="'i-lucide-search'"
        />
        <UPopover>
          <UButton variant="outline" leading-icon="i-lucide-arrow-up-down">Сортировка</UButton>
          <template #content>
            <div class="flex flex-col p-2 gap-1 min-w-[200px]">
              <UButton
                v-for="option in sortOptions"
                :key="option.value"
                variant="ghost"
                class="justify-start"
                :class="{ 'text-primary font-semibold': sortBy === option.value }"
                @click="sortBy = option.value"
              >
                {{ option.label }}
              </UButton>
            </div>
          </template>
        </UPopover>
      </div>
      <UPageList class="gap-2">
        <div v-if="loading" class="text-muted text-sm py-4">Ищем рецепты...</div>
        <div v-else-if="filteredRecipes.length === 0" class="text-muted text-sm py-4">
          Пока что рецептов нет. Вы можете создать новый по кнопке «Создать».
        </div>
        <RecipeCard
          v-else
          v-for="recipe in filteredRecipes"
          :id="recipe.id"
          :key="recipe.id"
          :title="recipe.title"
          :description="recipe.description"
          :author-name="recipe.authorName"
          :created-at="recipe.createdAt"
        />
      </UPageList>
    </div>
    <NuxtPage></NuxtPage>
  </div>
</template>

<script lang="ts" setup>
import RecipeCard from '@/components/RecipeCard.vue'
import { ref, computed, onMounted } from 'vue'

const router = useRouter()
const { startCreating } = useRecipeState()
const { recipes, loading, fetchRecipes } = useRecipes()

const searchQuery = ref('')
const sortBy = ref<'title' | 'author' | 'date'>('date')

const sortOptions = [
  { label: 'По названию', value: 'title' },
  { label: 'По автору', value: 'author' },
  { label: 'По дате создания', value: 'date' },
] as const

onMounted(fetchRecipes)

const filteredRecipes = computed(() => {
  let result = recipes.value.filter((r) =>
    r.title.toLowerCase().includes(searchQuery.value.toLowerCase()),
  )

  if (sortBy.value === 'title') {
    result = [...result].sort((a, b) => a.title.localeCompare(b.title))
  } else if (sortBy.value === 'author') {
    result = [...result].sort((a, b) => a.authorName.localeCompare(b.authorName))
  } else {
    result = [...result].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }

  return result
})

function onCreate() {
  startCreating()
  router.push('/recipes/recipe/edit')
}
</script>
