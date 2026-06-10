<template>
  <div class="flex gap-2 items-center">
    <p class="text-xs min-w-16">{{ label }}</p>
    <UProgress
      v-if="type !== 'calories'"
      class="flex-1"
      :color="type === 'proteins' ? 'neutral' : type === 'fats' ? 'warning' : 'primary'"
      :modelValue="value"
      :max="100"
    />
    <div v-else class="flex-1" />
    <p class="text-xs min-w-8 text-right">{{ value }}</p>
  </div>
</template>

<script lang="ts" setup>
type NutritionType = 'proteins' | 'fats' | 'carbs' | 'calories'

interface NutritionProgressBarProps {
  label: string
  value: number
  type: NutritionType
}

const props = defineProps<NutritionProgressBarProps>()
</script>
