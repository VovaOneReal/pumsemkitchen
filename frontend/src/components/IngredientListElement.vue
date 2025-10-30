<template>
  <div class="flex gap-2 items-center w-full">
    <input class="checkbox" type="checkbox" />
    <p class="w-full text-md mt-0 mb-0 font-semibold">{{ name }}</p>
    <div class="flex gap-1 items-baseline">
        <p class="text-sm mt-0 mb-0">{{ amount }}</p>
        <p class="text-sm mt-0 mb-0">{{ measure }}</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps({
    name: String,
    amount: Number,
    measure: String
})
</script>