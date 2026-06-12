<template>
  <div class="flex flex-col h-full py-4 px-2 w-64 flex-shrink-0">
    <div class="px-2 pb-4">
      <span class="text-sm font-semibold text-highlighted">Справка</span>
    </div>
    <div class="flex flex-col gap-1">
      <UButton
        icon="i-lucide-arrow-left"
        label="Назад"
        variant="ghost"
        color="primary"
        block
        class="justify-start"
        to="/"
      />
      <UButton
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        :label="item.label"
        :variant="getVariant(item.to)"
        color="primary"
        block
        class="justify-start"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
const route = useRoute()

const items = [{ label: 'О сервисе', to: '/help/about' }]

function getVariant(to: string): 'ghost' | 'solid' | 'soft' {
  if (route.path === to) return 'solid'
  if (route.path.startsWith(to + '/')) return 'soft'
  return 'ghost'
}
</script>
