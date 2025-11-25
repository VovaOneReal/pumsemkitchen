<template>
  <div
    @click="openCard"
    class="flex gap-2 w-full min-h-[170px] max-h-[170px] bg-base-200 rounded-box max-w-none hover:bg-base-300 hover:cursor-pointer transition-colors"
  >
    <img
      class="h-full object-cover rounded-l-[inherit] not-prose"
      src="https://placehold.co/170x170"
      alt=""
    />
    <div class="flex flex-col w-full h-full max-w-none p-2">
      <h3 class="mt-0">{{ props.title }}</h3>
      <p class="line-clamp-4 mb-0">
        {{ props.description }}
      </p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import router from '@/router'
import type { Recipe } from '@/types'
import { ref } from 'vue'

const props = defineProps<Recipe>()

const id = ref<number>(props.id)

function openCard() {
  router.push('/recipe')
}
</script>
