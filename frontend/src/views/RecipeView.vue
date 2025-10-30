<template>
  <div class="flex flex-col gap-6 w-full">
    <div class="flex gap-3 w-full items-center prose">
        <div class="btn btn-circle btn-accent btn-sm" @click="goBack"><arrow-left :size="20" /></div>
        <h2 class="mt-0">Название рецепта</h2>
    </div>
    <div class="flex flex-col gap-6 w-full overflow-y-scroll">
        <div class="flex gap-4 w-full max-h-[300px]">
            <img class="rounded-box" src="https://placehold.co/300x300" alt="">
            <div class="flex gap-2 flex-col prose max-w-none">
                <h3 class="mt-0 mb-0">Описание</h3>
                <p class="overflow-y-scroll">Lorem ipsum dolor sit amet consectetur adipisicing elit. Esse consequatur sit alias, deleniti facilis rem. Ex blanditiis aperiam ipsam dolorum esse aut consequuntur corrupti nihil facilis delectus voluptate aliquid eaque, vitae, alias commodi quisquam earum tempore fugit a necessitatibus praesentium! Quisquam, obcaecati maxime. Veniam, pariatur officia sint quis natus veritatis. Rerum dicta numquam eos maiores itaque consectetur enim, cupiditate iste architecto debitis est non cumque eveniet commodi aperiam magni quae quas aliquam delectus adipisci impedit porro nam illum culpa! Ea totam explicabo temporibus rem adipisci accusamus, animi ipsum numquam enim aliquid. Eaque, ducimus recusandae! Atque corrupti ab reprehenderit quibusdam a.</p>
            </div>
        </div>
        <div class="flex w-full gap-4">
            <div class="flex flex-col w-full gap-2 max-w-[300px]">
                <div class="flex w-full gap-2">
                    <div class="tooltip w-full">
                        <p class="tooltip-content">Добавить в Избранное</p>
                        <div class="btn btn-square w-full"><heart :size="24"/></div>
                    </div>
                    <div class="tooltip w-full">
                        <p class="tooltip-content">Добавить в коллекцию</p>
                        <div class="btn btn-square w-full"><folder-heart :size="24" /></div>
                    </div>
                    <div class="tooltip w-full">
                        <p class="tooltip-content">Добавить в семью</p>
                        <div class="btn btn-square w-full"><user-star :size="24" /></div>
                    </div>
                    <div class="tooltip w-full">
                        <p class="tooltip-content">Редактировать</p>
                        <div @click="editRecipe" class="btn btn-square w-full"><pencil :size="24" /></div>
                    </div>
                    <div class="tooltip w-full">
                        <p class="tooltip-content">Удалить</p>
                        <div onclick="deleteModal.showModal()" class="btn btn-square btn-error w-full"><trash2 :size="24" /></div>
                    </div>
                </div>
                <div class="flex flex-col w-full h-fit gap-2 prose rounded-box bg-base-200 p-4">
                    <div class="flex flex-col justify-center items-center">
                        <h3 class="mt-3">Энергетическая ценность</h3>
                        <p>на 100 гр. блюда</p>
                    </div>
                    <div class="flex flex-col">
                        <NutritionProgressBar label="Белки" :value=10 />
                        <NutritionProgressBar label="Жиры" :value=5 />
                        <NutritionProgressBar label="Углеводы" :value=23 />
                    </div>
                </div>
            </div>
            <div class="flex flex-col gap-2 prose w-full">
                <h3>Ингредиенты</h3>
                <div class="flex flex-col w-full gap-1">
                    <IngredientListElement name="Банка горошка" :amount=1 measure="шт."/>
                    <IngredientListElement name="Капуста" :amount=500 measure="гр." />
                    <IngredientListElement name="Баклажан" :amount=200 measure="гр." />
                    <IngredientListElement name="Баклажан" :amount=200 measure="гр." />
                    <IngredientListElement name="Баклажан" :amount=200 measure="гр." />
                </div>
            </div>
        </div>
        <div class="flex flex-col gap-6 prose max-w-none">
            <h3>Готовка</h3>
            <RecipeStep :step="1" description="Lorem ipsum dolor sit amet consectetur adipisicing elit. Esse consequatur sit alias, deleniti facilis rem. Ex blanditiis aperiam ipsam dolorum esse aut consequuntur corrupti nihil facilis delectus voluptate aliquid eaque, vitae, alias commodi quisquam earum tempore fugit a necessitatibus praesentium! Quisquam, obcaecati maxime." image-src="https://placehold.co/250x150"/>
            <RecipeStep :step="2" description="Lorem ipsum dolor sit amet consectetur adipisicing elit. Esse consequatur sit alias, deleniti facilis rem."/>
            <RecipeStep :step="3" description="Lorem ipsum dolor sit amet consectetur adipisicing elit. Esse consequatur sit alias, deleniti facilis rem. Ex blanditiis aperiam ipsam dolorum esse aut consequuntur corrupti nihil facilis delectus voluptate aliquid eaque." image-src="https://placehold.co/250x250"/>
            <RecipeStep :step="4" description="Lorem ipsum dolor sit amet consectetur adipisicing elit. Esse consequatur sit alias, deleniti facilis rem. Ex blanditiis aperiam ipsam dolorum esse aut consequuntur corrupti nihil facilis delectus voluptate aliquid eaque, vitae, alias commodi quisquam earum tempore fugit a necessitatibus praesentium! Quisquam, obcaecati maxime. Lorem ipsum dolor sit amet consectetur adipisicing elit. Esse consequatur sit alias, deleniti facilis rem. Ex blanditiis aperiam ipsam dolorum esse aut consequuntur corrupti nihil facilis delectus voluptate aliquid eaque, vitae, alias commodi quisquam earum tempore fugit a necessitatibus praesentium! Quisquam, obcaecati maxime" image-src="https://placehold.co/250x150"/>
            <RecipeStep :step="5" description="Lorem ipsum dolor sit amet consectetur adipisicing elit. Esse consequatur sit alias, deleniti facilis rem."/>
        </div>
    </div>
    <dialog id="deleteModal" class="modal">
        <div class="modal-box">
            <h3 class="text-lg font-bold">Подтвердите удаление</h3>
            <p class="py-4">Вы действительно хотите удалить рецепт?</p>
            <div class="modal-action">
            <form method="dialog" class="flex gap-4">
                <button class="btn btn-error">Удалить</button>
                <button class="btn">Отменить</button>
            </form>
            </div>
        </div>
    </dialog>
  </div>
</template>

<script lang="ts" setup>
import IngredientListElement from '@/components/IngredientListElement.vue';
import NutritionProgressBar from '@/components/NutritionProgressBar.vue';
import RecipeStep from '@/components/RecipeStep.vue';
import router from '@/router';

import { Heart, UserStar, FolderHeart, Pencil, Trash2, ArrowLeft } from 'lucide-vue-next';
function goBack() {
    router.back()
}

function editRecipe() {
    router.push("recipe/edit")
}
</script>