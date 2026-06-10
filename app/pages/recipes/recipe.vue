<template>
  <div class="flex flex-col gap-6 w-full h-full">
    <div v-if="$route.path == '/recipes/recipe'" class="flex gap-3 w-full items-center">
      <UButton size="sm" variant="ghost" class="rounded-full" to="/recipes">
        <template #leading>
          <arrow-left :size="20" />
        </template>
      </UButton>
      <h2>Название рецепта</h2>
    </div>
    <div
      v-if="$route.path == '/recipes/recipe'"
      class="flex flex-col gap-6 w-full overflow-y-auto px-2 h-full"
    >
      <div class="flex gap-4 w-full max-h-[300px]">
        <img class="rounded-md" src="https://placehold.co/300x300" alt="" />
        <div class="flex gap-2 flex-col">
          <h3>Описание</h3>
          <p class="overflow-y-scroll">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Esse consequatur sit alias,
            deleniti facilis rem. Ex blanditiis aperiam ipsam dolorum esse aut consequuntur corrupti
            nihil facilis delectus voluptate aliquid eaque, vitae, alias commodi quisquam earum
            tempore fugit a necessitatibus praesentium! Quisquam, obcaecati maxime. Veniam, pariatur
            officia sint quis natus veritatis. Rerum dicta numquam eos maiores itaque consectetur
            enim, cupiditate iste architecto debitis est non cumque eveniet commodi aperiam magni
            quae quas aliquam delectus adipisci impedit porro nam illum culpa! Ea totam explicabo
            temporibus rem adipisci accusamus, animi ipsum numquam enim aliquid. Eaque, ducimus
            recusandae! Atque corrupti ab reprehenderit quibusdam a.
          </p>
        </div>
      </div>
      <div class="flex w-full gap-4">
        <div class="flex flex-col w-full gap-2 max-w-[300px]">
          <div class="flex w-full justify-between">
            <UTooltip text="Добавить в Избранное">
              <UButton size="xl" variant="soft">
                <template #leading>
                  <heart :size="24" />
                </template>
              </UButton>
            </UTooltip>
            <UTooltip text="Добавить в коллекцию">
              <UButton size="xl" variant="soft">
                <template #leading>
                  <folder-heart :size="24" />
                </template>
              </UButton>
            </UTooltip>
            <UTooltip text="Добавить в семью">
              <UButton size="xl" variant="soft">
                <template #leading>
                  <user-star :size="24" />
                </template>
              </UButton>
            </UTooltip>
            <UTooltip text="Редактировать">
              <UButton size="xl" variant="soft" to="/recipes/recipe/edit">
                <template #leading>
                  <pencil :size="24" />
                </template>
              </UButton>
            </UTooltip>
            <UPopover>
              <UTooltip text="Удалить">
                <UButton size="xl" variant="soft" color="error">
                  <template #leading>
                    <trash2 :size="24" />
                  </template>
                </UButton>
              </UTooltip>
              <template #content>
                <div class="flex flex-col gap-4 p-4">
                  <div class="flex flex-col gap-2 justify-center items-center">
                    <p class="text-lg font-bold text-center">Подтвердите удаление</p>
                  </div>
                  <div class="flex gap-4">
                    <UButton block color="error">Удалить</UButton>
                    <UButton block variant="soft">Отменить</UButton>
                  </div>
                </div>
              </template>
            </UPopover>
          </div>
          <UCard class="flex flex-col w-full">
            <template #header>
              <div class="flex flex-col justify-center items-center gap-1">
                <p class="font-bold text-lg">Энергетическая ценность</p>
                <p>на 100 гр. блюда</p>
              </div>
            </template>
            <template #default>
              <div class="flex flex-col">
                <NutritionProgressBar type="proteins" label="Белки" :value="54" />
                <NutritionProgressBar type="fats" label="Жиры" :value="13" />
                <NutritionProgressBar type="carbs" label="Углеводы" :value="78" />
              </div>
            </template>
          </UCard>
        </div>
        <div class="flex flex-col gap-2 w-full">
          <h3>Ингредиенты</h3>
          <div class="flex flex-col w-full gap-1">
            <IngredientListElement name="Банка горошка" :amount="1" measure="шт." />
            <IngredientListElement name="Капуста" :amount="500" measure="гр." />
            <IngredientListElement name="Баклажан" :amount="200" measure="гр." />
            <IngredientListElement name="Баклажан" :amount="200" measure="гр." />
            <IngredientListElement name="Баклажан" :amount="200" measure="гр." />
          </div>
        </div>
      </div>
      <div class="flex flex-col gap-6">
        <!-- TODO: Добавить суммарное количество шагов или боковую отметку-трекер шагов -->
        <h3>Готовка</h3>
        <RecipeStep
          :step="1"
          description="Lorem ipsum dolor sit amet consectetur adipisicing elit. Esse consequatur sit alias, deleniti facilis rem. Ex blanditiis aperiam ipsam dolorum esse aut consequuntur corrupti nihil facilis delectus voluptate aliquid eaque, vitae, alias commodi quisquam earum tempore fugit a necessitatibus praesentium! Quisquam, obcaecati maxime."
          image-src="https://placehold.co/250x150"
        />
        <RecipeStep
          :step="2"
          description="Lorem ipsum dolor sit amet consectetur adipisicing elit. Esse consequatur sit alias, deleniti facilis rem."
        />
        <RecipeStep
          :step="3"
          description="Lorem ipsum dolor sit amet consectetur adipisicing elit. Esse consequatur sit alias, deleniti facilis rem. Ex blanditiis aperiam ipsam dolorum esse aut consequuntur corrupti nihil facilis delectus voluptate aliquid eaque."
          image-src="https://placehold.co/250x250"
        />
        <RecipeStep
          :step="4"
          description="Lorem ipsum dolor sit amet consectetur adipisicing elit. Esse consequatur sit alias, deleniti facilis rem. Ex blanditiis aperiam ipsam dolorum esse aut consequuntur corrupti nihil facilis delectus voluptate aliquid eaque, vitae, alias commodi quisquam earum tempore fugit a necessitatibus praesentium! Quisquam, obcaecati maxime. Lorem ipsum dolor sit amet consectetur adipisicing elit. Esse consequatur sit alias, deleniti facilis rem. Ex blanditiis aperiam ipsam dolorum esse aut consequuntur corrupti nihil facilis delectus voluptate aliquid eaque, vitae, alias commodi quisquam earum tempore fugit a necessitatibus praesentium! Quisquam, obcaecati maxime"
          image-src="https://placehold.co/250x150"
        />
        <RecipeStep
          :step="5"
          description="Lorem ipsum dolor sit amet consectetur adipisicing elit. Esse consequatur sit alias, deleniti facilis rem."
        />
      </div>
    </div>
    <NuxtPage></NuxtPage>
  </div>
</template>

<script lang="ts" setup>
import IngredientListElement from '@/components/IngredientListElement.vue'
import NutritionProgressBar from '@/components/NutritionProgressBar.vue'
import RecipeStep from '@/components/RecipeStep.vue'

import { Heart, UserStar, FolderHeart, Pencil, Trash2, ArrowLeft } from 'lucide-vue-next'
</script>
