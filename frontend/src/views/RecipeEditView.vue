<template>
  <div class="flex flex-col gap-6 w-full">
    <fieldset class="fieldset w-full">
        <legend class="fieldset-legend">Название рецепта</legend>
        <input type="text" class="input w-full" placeholder="Как называется рецепт?" />
    </fieldset>
    <div class="flex flex-col gap-6 w-full overflow-y-scroll overflow-x-hidden">
        <div class="flex gap-4 w-full max-h-[300px]">
            <img class="rounded-box" src="https://placehold.co/300x300" alt="">
            <div class="flex w-full gap-2 flex-col prose max-w-none">
                <h3 class="mt-0 mb-0">Описание</h3>
                <textarea class="textarea w-full overflow-y-scroll  h-full" name="" id="" placeholder="Описание рецепта..."></textarea>
            </div>
        </div>
        <div class="flex w-full gap-4">
            <div class="flex flex-col gap-2 prose w-full max-w-none">
                <h3>Ингредиенты</h3>
                <div class="flex flex-col w-full gap-1">
                    <IngredientEditingListElement />
                    <IngredientEditingListElement />
                    <IngredientEditingListElement />
                </div>
                <button class="btn btn-soft btn-accent w-full">Добавить</button>
            </div>
        </div>
        <div class="flex flex-col gap-6 prose max-w-none">
            <h3>Готовка</h3>
            <div class="flex flex-col w-full gap-1">
                <RecipeEditingStep :step="1" />
                <RecipeEditingStep :step="2" />
                <RecipeEditingStep :step="3" />
            </div>
            
            <button class="btn btn-soft btn-accent w-full">Добавить</button>
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
import IngredientEditingListElement from '@/components/IngredientEditingListElement.vue';
import RecipeEditingStep from '@/components/RecipeEditingStep.vue';
import router from '@/router';

function goBack() {
    router.back()
}
</script>

<style>

</style>