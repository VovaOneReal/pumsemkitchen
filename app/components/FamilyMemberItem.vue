<template>
  <div class="flex items-center gap-4 py-3">
    <span class="flex-1">{{ name }} ({{ login }})</span>
    <UBadge v-if="isOwner" color="success" variant="subtle" icon="i-lucide-crown">
      Владелец
    </UBadge>
    <UButton
      v-if="canKick"
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
  isOwner: boolean
  canKick?: boolean
}>()

defineEmits<{
  kick: []
}>()
</script>
