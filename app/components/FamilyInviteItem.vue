<template>
  <div class="flex items-center gap-4 py-3">
    <span class="font-semibold flex-shrink-0">{{ familyName }}</span>
    <span class="text-sm text-muted flex-1">Владелец: {{ ownerName }}</span>
    <div class="flex gap-2 flex-shrink-0">
      <UButton
        leading-icon="i-lucide-ban"
        label="Отклонить"
        variant="ghost"
        color="error"
        @click="$emit('decline')"
      />
      <UButton
        leading-icon="i-lucide-check"
        label="Принять"
        variant="ghost"
        color="success"
        @click="$emit('accept')"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  familyName: string
  ownerName: string
}>()

defineEmits<{
  accept: []
  decline: []
}>()
</script>
