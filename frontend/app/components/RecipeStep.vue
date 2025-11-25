<template>
  <div class="flex w-full gap-4 min-h-[100px] prose max-w-none">
    <div class="flex items-baseline justify-center min-w-8 max-w-8 min-h-8 max-h-8 rounded-full border-2 font-bold ">{{ step }}</div>
    <p class="mt-0 mb-0">{{ description }}</p>
    <img class="min-w-[250px] max-w-[250px] min-h-[250px] max-h-[250px] object-fit bg-base-200 rounded-box mt-0 mb-0" v-if="imageSrc" :src=imageSrc alt="">
  </div>
</template>

<script lang="ts" setup>
const props = defineProps({
    step: Number,
    description: String,
    imageSrc: String || undefined
})
</script>