<template>
  <div class="flex flex-col w-full gap-4 prose max-w-none">
    <div class="flex flex-col w-full">
      <h2 class="mt-0">Кулинарная книга</h2>
      <router-link to="/recipe/edit" class="btn btn-accent w-fit">Добавить рецепт</router-link>
    </div>
    <div class="flex flex-col w-full gap-2 h-full overflow-y-auto">
      <RecipeCard
        v-for="recipe in recipes"
        :key="recipe.id"
        :id="recipe.id"
        :title="recipe.title"
        :description="recipe.description"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import RecipeCard from '@/components/RecipeCard.vue'
import type { Recipe } from '@/types'
import { reactive } from 'vue'

const recipes: Recipe[] = reactive([
  {
    id: 1,
    title: 'Lorem, ipsum dolor sit amet',
    description:
      'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Maxime illo vero a, laudantium sed minima in magni. Tenetur quia dicta ipsum porro quibusdam labore! Reiciendis amet harum voluptatum vel soluta. Lorem, ipsum dolor sit amet consectetur adipisicing elit. Magnam, architecto! Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quas aspernatur porro dolore architecto ducimus voluptatibus dignissimos impedit. Esse, debitis nulla.',
  },
  {
    id: 2,
    title: 'Lorem, ipsum dolor sit amet',
    description:
      'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Maxime illo vero a, laudantium sed minima in magni. Tenetur quia dicta ipsum porro quibusdam labore! Reiciendis amet harum voluptatum vel soluta. Lorem, ipsum dolor sit amet consectetur adipisicing elit. Magnam, architecto! Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quas aspernatur porro dolore architecto ducimus voluptatibus dignissimos impedit. Esse, debitis nulla.',
  },
  {
    id: 3,
    title: 'Lorem, ipsum dolor sit amet',
    description:
      'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Maxime illo vero a, laudantium sed minima in magni. Tenetur quia dicta ipsum porro quibusdam labore! Reiciendis amet harum voluptatum vel soluta. Lorem, ipsum dolor sit amet consectetur adipisicing elit. Magnam, architecto! Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quas aspernatur porro dolore architecto ducimus voluptatibus dignissimos impedit. Esse, debitis nulla.',
  },
  {
    id: 4,
    title: 'Lorem, ipsum dolor sit amet',
    description:
      'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Maxime illo vero a, laudantium sed minima in magni. Tenetur quia dicta ipsum porro quibusdam labore! Reiciendis amet harum voluptatum vel soluta. Lorem, ipsum dolor sit amet consectetur adipisicing elit. Magnam, architecto! Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quas aspernatur porro dolore architecto ducimus voluptatibus dignissimos impedit. Esse, debitis nulla.',
  },
  {
    id: 5,
    title: 'Lorem, ipsum dolor sit amet',
    description:
      'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Maxime illo vero a, laudantium sed minima in magni. Tenetur quia dicta ipsum porro quibusdam labore! Reiciendis amet harum voluptatum vel soluta. Lorem, ipsum dolor sit amet consectetur adipisicing elit. Magnam, architecto! Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quas aspernatur porro dolore architecto ducimus voluptatibus dignissimos impedit. Esse, debitis nulla.',
  },
  {
    id: 6,
    title: 'Lorem, ipsum dolor sit amet',
    description:
      'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Maxime illo vero a, laudantium sed minima in magni. Tenetur quia dicta ipsum porro quibusdam labore! Reiciendis amet harum voluptatum vel soluta. Lorem, ipsum dolor sit amet consectetur adipisicing elit. Magnam, architecto! Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quas aspernatur porro dolore architecto ducimus voluptatibus dignissimos impedit. Esse, debitis nulla.',
  },
])
</script>
