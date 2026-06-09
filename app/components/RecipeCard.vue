<template>
  <UPageCard to="/recipebook/recipe" variant="soft">
    <template #body>
      <div class="w-full flex gap-4">
        <img class="h-full object-cover rounded-lg" src="https://placehold.co/170x170" alt="" />
        <div class="flex flex-col gap-2">
          <h3 class="ui-header-3">{{ props.title }}</h3>
          <p class="max-h-[96px] line-clamp-4">{{ props.description }}</p>
        </div>
      </div>
    </template>
  </UPageCard>
</template>

<script lang="ts" setup>
import type { Recipe } from '@/types'
import { ref } from 'vue'

const props = defineProps<Recipe>()

const id = ref<number>(props.id)
</script>
