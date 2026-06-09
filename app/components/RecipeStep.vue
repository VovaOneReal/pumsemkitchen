<template>
  <div class="flex w-full gap-4 min-h-[100px]">
    <div
      class="flex items-center justify-center min-w-8 max-w-8 min-h-8 max-h-8 rounded-full border border-primary text-primary font-bold"
    >
      {{ step }}
    </div>
    <p>{{ description }}</p>
    <img
      class="min-w-[250px] max-w-[250px] min-h-[250px] max-h-[250px] object-cover bg-base-200 rounded-md"
      v-if="imageSrc"
      :src="imageSrc"
      alt=""
    />
  </div>
</template>

<script lang="ts" setup>
const props = defineProps({
  step: Number,
  description: String,
  imageSrc: String || undefined,
})
</script>
