<template>
  <div class="flex w-full gap-4 items-start">
    <div
      class="flex items-center justify-center shrink-0 min-w-8 max-w-8 min-h-8 max-h-8 rounded-full border border-primary text-primary font-bold"
    >
      {{ step }}
    </div>
    <p class="flex-1">{{ description }}</p>
    <AppImage
      v-if="imageSrc"
      :src="imageSrc"
      class="shrink-0 min-w-[250px] max-w-[250px] min-h-[150px] max-h-[150px]"
    />
  </div>
</template>

<script lang="ts" setup>
const props = defineProps({
  step: Number,
  description: String,
  imageSrc: String,
})
</script>
