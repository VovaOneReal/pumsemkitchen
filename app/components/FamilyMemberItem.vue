<template>
  <div class="flex items-center gap-4 py-3">
    <span class="flex-1">{{ name }} ({{ login }})</span>
    <UButton
      label="Выгнать"
      variant="ghost"
      color="error"
      @click="$emit('kick')"
    />
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  name: string
  login: string
}>()

defineEmits<{
  kick: []
}>()
</script>
