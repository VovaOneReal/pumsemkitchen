<template>
  <div @click="openCard" class="flex gap-2 w-full min-h-[170px] max-h-[170px] bg-base-200 rounded-box prose max-w-none hover:bg-base-300 hover:cursor-pointer transition-colors">
    <img class="h-full object-cover rounded-l-[inherit]" src="https://placehold.co/170x170" alt="">
    <div class="flex flex-col gap-2 w-full prose max-w-none p-2">
        <h3>Название рецепта</h3>
        <p class="line-clamp-3">Lorem, ipsum dolor sit amet consectetur adipisicing elit. Maxime illo vero a, laudantium sed minima in magni. Tenetur quia dicta ipsum porro quibusdam labore! Reiciendis amet harum voluptatum vel soluta. Lorem, ipsum dolor sit amet consectetur adipisicing elit. Magnam, architecto! Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quas aspernatur porro dolore architecto ducimus voluptatibus dignissimos impedit. Esse, debitis nulla.</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import router from '@/router';

function openCard() {
  router.push("/recipe")
}
</script>