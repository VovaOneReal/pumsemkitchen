<template>
  <div class="flex flex-col w-full gap-4 prose max-w-none">
    <h2>Кулинарная книга</h2>
    <div class="flex flex-col gap-2 overflow-y-scroll">
        <RecipeCard />
        <RecipeCard />
        <RecipeCard />
        <RecipeCard />
        <RecipeCard />
        <RecipeCard />
        <RecipeCard />
    </div>
    
  </div>
</template>

<script lang="ts" setup>
import RecipeCard from '@/components/RecipeCard.vue';


</script>