<template>
  <div class="flex flex-col rounded-xl border border-default bg-default shadow-sm overflow-hidden">
    <!-- Заголовок приёма пищи -->
    <div class="px-4 py-3 border-b border-default">
      <h4 class="text-xl font-bold">{{ name }}</h4>
    </div>

    <!-- Горизонтально прокручиваемые карточки рецептов -->
    <div class="px-4 py-4 overflow-x-auto">
      <div class="flex gap-3" :class="recipes.length === 0 ? '' : 'w-max'">
        <p v-if="recipes.length === 0" class="text-sm text-muted py-2">
          Рецептов нет. Добавьте рецепт в этот приём пищи.
        </p>
        <MealRecipeCard
          v-for="recipe in recipes"
          :key="recipe.id"
          :title="recipe.title"
          :image-url="recipe.imageUrl"
          :portions="recipe.portions"
          @delete="$emit('delete-recipe', recipe.id)"
          @update-portions="(p) => $emit('update-portions', recipe.id, p)"
        />
      </div>
    </div>

    <!-- Коллапс КБЖУ и стоимость -->
    <div class="border-t border-default">
      <button
        class="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-elevated transition-colors"
        @click="nutritionOpen = !nutritionOpen"
      >
        <span>КБЖУ и стоимость</span>
        <UIcon
          :name="nutritionOpen ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
          class="text-muted w-4 h-4"
        />
      </button>
      <div v-if="nutritionOpen" class="px-4 pb-4 flex flex-col gap-1 text-sm">
        <p><span class="font-semibold">Суммарная стоимость:</span> {{ nutrition.cost.toLocaleString('ru-RU') }}₽</p>
        <p><span class="font-semibold">Всего калорий:</span> {{ nutrition.calories }} ккал</p>
        <p><span class="font-semibold">Всего белков:</span> {{ nutrition.proteins }} г</p>
        <p><span class="font-semibold">Всего жиров:</span> {{ nutrition.fats }} г</p>
        <p><span class="font-semibold">Всего углеводов:</span> {{ nutrition.carbs }} г</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
export interface MealRecipe {
  id: number
  title: string
  imageUrl: string | null
  portions: number
}

export interface MealNutrition {
  cost: number
  calories: number
  proteins: number
  fats: number
  carbs: number
}

defineProps<{
  name: string
  recipes: MealRecipe[]
  nutrition: MealNutrition
}>()

defineEmits<{
  'delete-recipe': [id: number]
  'update-portions': [id: number, portions: number]
}>()

const nutritionOpen = ref(false)
</script>
