<template>
  <div class="flex w-full gap-2 items-center">
    <DragElement />
    <div
      class="flex items-center justify-center min-w-8 max-w-8 min-h-8 max-h-8 rounded-full border font-bold"
    >
      {{ step + 1 }}
    </div>
    <UTextarea
      class="w-full"
      placeholder="Опишите действия на этом шаге..."
      v-model="description"
      :rows="3"
      :maxrows="12"
      autoresize
    ></UTextarea>
    <UTooltip text="Загрузить иллюстрацию">
      <UButton square color="neutral" variant="soft"><Upload /></UButton>
    </UTooltip>
    <UButton color="error" variant="ghost" square @click="$emit('delete', props.step)"
      ><X
    /></UButton>
  </div>
</template>

<script lang="ts" setup>
import { X, Upload } from 'lucide-vue-next'
import type { ModelRef } from 'vue'
import DragElement from './DragElement.vue'
const props = defineProps({
  step: Number,
})

const description: ModelRef<string | undefined> = defineModel('description')

const emit = defineEmits(['delete'])
</script>
