<template>
  <div class="flex flex-col w-full px-2">
    <div v-if="$route.path == '/recipes'" class="flex flex-col w-full gap-4">
      <div class="flex items-center justify-between w-full">
        <h2 class="ui-header-2">Рецепты</h2>
        <UButton leading-icon="i-lucide-plus" label="Создать" @click="onCreate" />
      </div>
      <div class="flex gap-2 items-center">
        <UInput
          v-model="searchQuery"
          placeholder="Название..."
          class="w-64"
          :trailing-icon="'i-lucide-search'"
        />
        <UPopover>
          <UButton variant="outline" leading-icon="i-lucide-arrow-up-down">{{ currentSortLabel }}</UButton>
          <template #content>
            <div class="flex flex-col p-2 gap-1 min-w-[180px]">
              <UButton
                v-for="option in sortOptions"
                :key="option.value"
                variant="ghost"
                class="justify-start"
                :trailing-icon="sortBy === option.value ? 'i-lucide-check' : undefined"
                @click="sortBy = option.value"
              >
                {{ option.label }}
              </UButton>
            </div>
          </template>
        </UPopover>
      </div>
      <p v-if="!loading" class="text-sm text-muted">{{ filteredRecipes.length }} {{ filteredRecipes.length === 1 ? 'рецепт' : filteredRecipes.length < 5 ? 'рецепта' : 'рецептов' }}</p>
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
useHead({ title: 'Рецепты' })
import RecipeCard from '@/components/RecipeCard.vue'
import { ref, computed, onMounted } from 'vue'

const route = useRoute()
const router = useRouter()
const { startCreating } = useRecipeState()
const { recipes, loading, fetchRecipes } = useRecipes()

const searchQuery = ref('')
const sortBy = ref<'title-asc' | 'title-desc' | 'date-desc' | 'date-asc'>('date-desc')

const sortOptions = [
  { label: 'По названию А-Я', value: 'title-asc' },
  { label: 'По названию Я-А', value: 'title-desc' },
  { label: 'По дате создания: сначала новые', value: 'date-desc' },
  { label: 'По дате создания: сначала старые', value: 'date-asc' },
] as const

const currentSortLabel = computed(
  () => sortOptions.find((o) => o.value === sortBy.value)?.label ?? 'Сортировка',
)

onMounted(fetchRecipes)

// Повторно загружаем рецепты при возврате на страницу списка (например, после создания)
watch(
  () => route.path,
  (path) => {
    if (path === '/recipes') fetchRecipes()
  },
)

const filteredRecipes = computed(() => {
  let result = recipes.value.filter((r) =>
    r.title.toLowerCase().includes(searchQuery.value.toLowerCase()),
  )

  if (sortBy.value === 'title-asc') {
    result = [...result].sort((a, b) => a.title.localeCompare(b.title, 'ru'))
  } else if (sortBy.value === 'title-desc') {
    result = [...result].sort((a, b) => b.title.localeCompare(a.title, 'ru'))
  } else if (sortBy.value === 'date-asc') {
    result = [...result].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
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
