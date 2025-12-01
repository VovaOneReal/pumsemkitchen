<template>
  <div class="flex gap-2 items-baseline">
    <p class="text-xs min-w-16">{{ label }}</p>
    <!-- TODO: добавить отдельные цвета для нутриций -->
    <UProgress
      class="progress"
      :color="props.type == 'proteins' ? 'neutral' : props.type == 'fats' ? 'warning' : 'primary'"
      :modelValue="props.value"
      :max="100"
    ></UProgress>
    <p class="text-xs min-w-8">{{ value }}</p>
  </div>
</template>

<script lang="ts" setup>
type NutritionType = 'proteins' | 'fats' | 'carbs'

interface NutritionProgressBarProps {
  label: string
  value: number
  type: NutritionType
}

const props = defineProps<NutritionProgressBarProps>()
</script>
