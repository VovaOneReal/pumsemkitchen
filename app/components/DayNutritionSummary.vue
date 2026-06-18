<template>
  <div class="rounded-xl border border-default bg-default shadow-sm px-4 py-4 flex flex-col gap-2">
    <h4 class="text-base font-semibold">{{ title }}</h4>
    <div class="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
      <p><span class="text-muted">Стоимость:</span> {{ formatCost(nutrition.cost) }} ₽</p>
      <p><span class="text-muted">Калории:</span> {{ formatNutr(nutrition.calories) }} ккал</p>
      <p><span class="text-muted">Белки:</span> {{ formatNutr(nutrition.proteins) }} г</p>
      <p><span class="text-muted">Жиры:</span> {{ formatNutr(nutrition.fats) }} г</p>
      <p><span class="text-muted">Углеводы:</span> {{ formatNutr(nutrition.carbs) }} г</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { NutritionValues } from '~~/app/types'

withDefaults(
  defineProps<{ nutrition: NutritionValues; title?: string }>(),
  { title: 'Итого за день' },
)

function formatNutr(val: number): string {
  return val.toFixed(1)
}

function formatCost(val: number): string {
  return val.toLocaleString('ru-RU', { maximumFractionDigits: 0 })
}
</script>
