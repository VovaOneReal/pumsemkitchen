<template>
  <div class="flex flex-col gap-6 w-full">
    <fieldset class="fieldset w-full">
      <legend class="fieldset-legend">Название рецепта</legend>
      <input type="text" class="input w-full" placeholder="Как называется рецепт?" />
    </fieldset>
    <div class="flex flex-col gap-6 w-full h-full overflow-y-auto overflow-x-hidden">
      <div class="flex gap-4 w-full max-h-[300px]">
        <img class="rounded-box" src="https://placehold.co/300x300" alt="" />
        <div class="flex w-full gap-2 flex-col prose max-w-none">
          <h3 class="mt-0 mb-0">Описание</h3>
          <textarea
            class="textarea w-full overflow-y-scroll h-full"
            name=""
            id=""
            placeholder="Описание рецепта..."
          ></textarea>
        </div>
      </div>
      <div class="flex w-full gap-4">
        <div class="flex flex-col gap-2 prose w-full max-w-none">
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
          <button
            @click="
              ingredients.push({
                id: ++ingredientsAmount,
                name: '',
                isOptional: false,
                amount: 1,
                amountType: 'table_spoon',
              })
            "
            class="btn btn-soft btn-accent w-full"
          >
            Добавить ингредиент
          </button>
        </div>
      </div>
      <div class="flex flex-col gap-2 prose max-w-none">
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

        <button
          @click="recipeSteps.push({ step: recipeSteps.length, description: '' })"
          class="btn btn-soft btn-accent w-full"
        >
          Добавить шаг
        </button>
      </div>
    </div>
    <div class="flex gap-3 w-full items-center prose">
      <div @click="goBack" class="btn btn-accent">Сохранить</div>
      <button onclick="cancelModal.show()" class="btn">Отменить</button>
    </div>
    <dialog id="cancelModal" class="modal">
      <div class="modal-box">
        <h3 class="text-lg font-bold">Подтвердите отмену</h3>
        <p class="py-4">Все изменения будут утеряны. Точно отменить?</p>
        <div class="modal-action">
          <form method="dialog" class="flex gap-4">
            <button @click="goBack" class="btn btn-error">Отменить</button>
            <button class="btn">Вернуться</button>
          </form>
        </div>
      </div>
    </dialog>
  </div>
</template>

<script lang="ts" setup>
import IngredientEditingListElement from '@/components/IngredientEditingListElement.vue'
import RecipeEditingStep from '@/components/RecipeEditingStep.vue'
import router from '@/router'
import { reactive } from 'vue'

import type { Ingredient, RecipeStep } from '@/types'

const ingredientsAmount = 0
const ingredients: Ingredient[] = reactive([])

const recipeSteps: RecipeStep[] = reactive([])

function goBack() {
  router.back()
}

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
