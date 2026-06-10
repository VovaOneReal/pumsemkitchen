<template>
  <div class="flex flex-col gap-6 w-full h-full">
    <!-- Заголовок -->
    <div class="flex items-center gap-3 flex-shrink-0">
      <UButton icon="i-lucide-arrow-left" variant="ghost" square to="/recipes/recipe" />
      <UButton color="primary">Сохранить</UButton>
      <h1 class="text-2xl font-bold">Изменение рецепта</h1>
    </div>

    <!-- Основной контент -->
    <div class="flex gap-6 w-full overflow-y-auto">
      <!-- Левая колонка: обложка -->
      <div class="flex flex-col gap-2 w-48 flex-shrink-0">
        <h3 class="font-semibold">Обложка</h3>
        <AppImageUpload v-model="coverImage" class="w-full aspect-square" />
      </div>

      <!-- Правая колонка: основные поля -->
      <div class="flex-1 flex flex-col gap-6 pb-4">
        <!-- Название -->
        <div class="flex flex-col gap-2">
          <h3 class="font-semibold">Название</h3>
          <UInput
            v-model="title"
            type="text"
            class="w-full"
            placeholder="Введите название рецепта..."
            :maxlength="32"
          />
        </div>

        <!-- Описание -->
        <div class="flex flex-col gap-2">
          <h3 class="font-semibold">Описание</h3>
          <UTextarea
            v-model="description"
            class="w-full"
            :rows="5"
            :maxrows="12"
            autoresize
            placeholder="Введите описание рецепта..."
          />
        </div>

        <!-- Ингредиенты -->
        <div class="flex flex-col gap-2">
          <div class="flex items-center justify-between">
            <h3 class="font-semibold">Ингредиенты</h3>
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-500">На количество порций</span>
              <UInputNumber v-model="portions" orientation="horizontal" :min="1" class="w-28" />
            </div>
          </div>
          <UButton
            block
            variant="soft"
            icon="i-lucide-plus"
            @click="addIngredient"
          >
            Добавить ингредиент
          </UButton>
          <div class="flex flex-col w-full gap-1">
            <IngredientEditingListElement
              v-for="ingredient in ingredients"
              :key="ingredient.id"
              :id="ingredient.id"
              v-model:name="ingredient.name"
              v-model:note="ingredient.note"
              v-model:is-optional="ingredient.isOptional"
              v-model:amount="ingredient.amount"
              v-model:amount-type="ingredient.amountType"
              @delete="deleteIngredient"
            />
          </div>
        </div>

        <!-- Готовка -->
        <div class="flex flex-col gap-2">
          <h3 class="font-semibold">Готовка</h3>
          <UButton
            block
            variant="soft"
            icon="i-lucide-plus"
            @click="recipeSteps.push({ step: recipeSteps.length, description: '' })"
          >
            Добавить шаг
          </UButton>
          <div class="flex flex-col w-full gap-1">
            <RecipeEditingStep
              v-for="step in recipeSteps"
              :key="step.step"
              :step="step.step"
              v-model:description="step.description"
              @delete="deleteRecipeStep"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import IngredientEditingListElement from '@/components/IngredientEditingListElement.vue'
import RecipeEditingStep from '@/components/RecipeEditingStep.vue'
import { reactive, ref } from 'vue'
import type { Ingredient, RecipeStep } from '@/types'

const title = ref('')
const description = ref('')
const coverImage = ref<string | null>(null)
const portions = ref(4)

let nextIngredientId = 0
const ingredients: Ingredient[] = reactive([])
const recipeSteps: RecipeStep[] = reactive([])

function addIngredient() {
  ingredients.push({
    id: ++nextIngredientId,
    name: '',
    note: '',
    isOptional: false,
    amount: 4,
    amountType: 'g',
  })
}

function deleteIngredient(id: number) {
  const idx = ingredients.findIndex((i) => i.id === id)
  if (idx !== -1) ingredients.splice(idx, 1)
}

function deleteRecipeStep(step: number) {
  recipeSteps.splice(step, 1)
  for (let i = step; i < recipeSteps.length; i++) {
    recipeSteps[i].step -= 1
  }
}
</script>
