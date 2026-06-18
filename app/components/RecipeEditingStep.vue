<template>
  <div class="flex w-full gap-2 items-start">
    <DragElement class="mt-2" />
    <div
      class="flex items-center justify-center min-w-8 max-w-8 min-h-8 max-h-8 rounded-full border font-bold mt-2"
    >
      {{ (props.step ?? 0) + 1 }}
    </div>
    <UTextarea
      class="flex-1"
      placeholder="Что нужно сделать на этом шаге?"
      v-model="description"
      :rows="3"
      :maxrows="12"
      autoresize
    />
    <!-- <AppImageUpload v-model="imageSrc" class="w-24 h-24 min-w-24" /> -->
    <UButton color="error" variant="ghost" square class="mt-2" @click="$emit('delete', props.step)">
      <X />
    </UButton>
  </div>
</template>

<script lang="ts" setup>
import { X } from 'lucide-vue-next'
import type { ModelRef } from 'vue'
import DragElement from './DragElement.vue'

const props = defineProps({
  step: Number,
})

const description: ModelRef<string | undefined> = defineModel('description')
const imageSrc = defineModel<string | null>('imageSrc', { default: null })

const emit = defineEmits(['delete'])
</script>
