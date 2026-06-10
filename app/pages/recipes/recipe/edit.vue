<template>
  <div class="flex flex-col gap-6 w-full h-full">
    <div class="flex flex-col gap-6 w-full h-full overflow-y-auto px-2">
      <UFormField label="Название рецепта" class="w-full">
        <UInput type="text" class="w-full" size="xl" placeholder="Как называется рецепт?" />
      </UFormField>
      <div class="flex flex-col gap-6 w-full h-full">
        <div class="flex gap-4 w-full max-h-[300px]">
          <img class="rounded-md" src="https://placehold.co/300x300" alt="" />
          <div class="flex w-full gap-2 flex-col">
            <h3>Описание</h3>
            <UTextarea
              class="w-full"
              :rows="12"
              :maxrows="12"
              name=""
              id=""
              placeholder="Описание рецепта..."
            ></UTextarea>
          </div>
        </div>
        <div class="flex w-full gap-4">
          <div class="flex flex-col gap-2 w-full">
            <h3>Ингредиенты</h3>
            <div class="flex flex-col w-full gap-1">
              <IngredientEditingListElement
                v-for="ingredient in ingredients"
                :key="ingredient.id"
                :id="ingredientsAmount"
                v-model:name="ingredient.name"
                v-model:is-optional="ingredient.isOptional"
                v-model:amount="ingredient.amount"
                v-model:amount-type="ingredient.amountType"
                @delete="(id) => deleteIngredient(id)"
              />
            </div>
            <UButton
              @click="
                ingredients.push({
                  id: ++ingredientsAmount,
                  name: '',
                  isOptional: false,
                  amount: 1,
                  amountType: 'table_spoon',
                })
              "
              block
              variant="soft"
            >
              Добавить ингредиент
            </UButton>
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <h3>Готовка</h3>
          <div class="flex flex-col w-full gap-1">
            <RecipeEditingStep
              v-for="step in recipeSteps"
              :key="step.step"
              @delete="(step) => deleteRecipeStep(step)"
              :step="step.step"
              v-model:description="step.description"
            />
          </div>
          <UButton
            @click="recipeSteps.push({ step: recipeSteps.length, description: '' })"
            block
            variant="soft"
          >
            Добавить шаг
          </UButton>
        </div>
      </div>
    </div>
    <div class="flex gap-3 w-full h-fit items-center">
      <UButton to="/recipes/recipe">Сохранить</UButton>
      <!-- TODO: цвет кнопки должен меняться в зависимости от наличия изменений в рецепте -->
      <UPopover>
        <UButton variant="ghost">Отменить</UButton>
        <template #content>
          <div class="flex flex-col gap-4 p-4">
            <div class="flex flex-col gap-2 justify-center items-center">
              <p class="text-lg font-bold text-center">Подтвердите отмену</p>
              <p class="text-center">Внесённые изменения будут утеряны.</p>
            </div>
            <div class="flex gap-4">
              <UButton block color="error">Отменить</UButton>
              <UButton to="/recipes/recipe" block variant="soft">Вернуться</UButton>
            </div>
          </div>
        </template>
      </UPopover>
    </div>
  </div>
</template>

<script lang="ts" setup>
import IngredientEditingListElement from '@/components/IngredientEditingListElement.vue'
import RecipeEditingStep from '@/components/RecipeEditingStep.vue'
import { reactive } from 'vue'

import type { Ingredient, RecipeStep } from '@/types'

const ingredientsAmount = 0
const ingredients: Ingredient[] = reactive([])

const recipeSteps: RecipeStep[] = reactive([])

function deleteIngredient(id: number) {
  for (let i = 0; i < ingredients.length; i++) {
    if (ingredients[i].id == id) {
      ingredients.splice(i, 1)
    }
  }
}

function deleteRecipeStep(step: number) {
  console.log('Delete step', step)
  recipeSteps.splice(step, 1)
  for (let i = step; step < recipeSteps.length; i++) {
    recipeSteps[i].step -= 1
    console.log('Reduce step', step)
  }
}
</script>
