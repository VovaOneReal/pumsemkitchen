<template>
  <div class="flex gap-3 items-start w-full py-1">
    <UCheckbox size="xl" class="shrink-0 mt-0.5" />
    <div class="flex-1 min-w-0">
      <p class="text-sm">{{ name }}</p>
      <p v-if="note" class="text-xs text-muted">{{ note }}</p>
    </div>
    <div class="flex items-center gap-1 shrink-0">
      <template v-if="optional">
        <span class="text-sm text-muted">по вкусу</span>
      </template>
      <template v-else>
        <span class="text-sm">{{ amount }}</span>
        <span class="text-sm text-muted">{{ measure }}</span>
      </template>
    </div>
    <span v-if="cost !== undefined" class="text-sm min-w-12 text-right shrink-0">{{ cost }}₽</span>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps({
  name: String,
  amount: Number,
  measure: String,
  optional: Boolean,
  note: String,
  cost: Number,
})
</script>
