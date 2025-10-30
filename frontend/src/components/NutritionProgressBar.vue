<template>
  <div class="flex gap-2 items-baseline">
    <p class="text-xs min-w-16 mt-0">{{ label }}</p>
    <progress class="progress" :value=props.value max="100"></progress>
    <p class="text-xs min-w-8 mt-0">{{ value }}</p>
</div>
</template>

<script lang="ts" setup>
const props = defineProps({
    label: String,
    value: Number
})
</script>
