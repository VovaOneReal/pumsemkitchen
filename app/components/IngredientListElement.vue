<template>
  <div class="flex gap-2 items-center w-full">
    <UCheckbox size="xl" :label="props.name" class="w-full" />
    <div class="flex gap-1 items-baseline">
      <p class="text-sm">{{ amount }}</p>
      <p class="text-sm">{{ measure }}</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps({
  name: String,
  amount: Number,
  measure: String,
})
</script>
