<template>
  <div class="flex flex-col w-full px-2 gap-4">
    <!-- Заголовок -->
    <div class="flex items-center gap-2 min-w-0">
      <UButton icon="i-lucide-arrow-left" variant="ghost" color="neutral" :to="`/menu/${menuId}`" />
      <h2 class="ui-header-2 truncate">{{ menuTitle }} / {{ formattedDay }}</h2>
    </div>

    <!-- Подзаголовок -->
    <h3 class="text-2xl font-bold">Приёмы пищи</h3>

    <!-- Карточки приёмов пищи -->
    <div class="flex flex-col gap-4">
      <MealCard
        v-for="meal in meals"
        :key="meal.id"
        :name="meal.name"
        :recipes="meal.recipes"
        :nutrition="meal.nutrition"
        @delete-recipe="(recipeId) => deleteRecipe(meal.id, recipeId)"
        @update-portions="(recipeId, portions) => updatePortions(meal.id, recipeId, portions)"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { MealRecipe, MealNutrition } from '@/components/MealCard.vue'

useHead({ title: 'День меню' })

const route = useRoute()

const menuId = computed(() => String(route.params.id))
const dayParam = computed(() => String(route.params.day))

const menuTitle = ref('Название меню')

// "24 марта 2026"
const formattedDay = computed(() => {
  const [y, m, d] = dayParam.value.split('-')
  const date = new Date(Number(y), Number(m) - 1, Number(d))
  return date.toLocaleString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
})

interface Meal {
  id: number
  name: string
  recipes: MealRecipe[]
  nutrition: MealNutrition
}

// Фиксированные приёмы пищи с моковыми рецептами
const meals = ref<Meal[]>([
  {
    id: 1,
    name: 'Завтрак',
    recipes: [
      { id: 1, title: 'Название рецепта', imageUrl: null, portions: 5 },
      { id: 2, title: 'Название рецепта', imageUrl: null, portions: 5 },
    ],
    nutrition: { cost: 1500, calories: 1234, proteins: 340, fats: 340, carbs: 340 },
  },
  {
    id: 2,
    name: 'Обед',
    recipes: [
      { id: 3, title: 'Название рецепта', imageUrl: null, portions: 4 },
    ],
    nutrition: { cost: 800, calories: 980, proteins: 210, fats: 180, carbs: 290 },
  },
  {
    id: 3,
    name: 'Ужин',
    recipes: [],
    nutrition: { cost: 0, calories: 0, proteins: 0, fats: 0, carbs: 0 },
  },
])

function deleteRecipe(mealId: number, recipeId: number) {
  const meal = meals.value.find((m) => m.id === mealId)
  if (meal) meal.recipes = meal.recipes.filter((r) => r.id !== recipeId)
}

function updatePortions(mealId: number, recipeId: number, portions: number) {
  const meal = meals.value.find((m) => m.id === mealId)
  const recipe = meal?.recipes.find((r) => r.id === recipeId)
  if (recipe) recipe.portions = portions
}
</script>
