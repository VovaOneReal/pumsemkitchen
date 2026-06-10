<template>
  <div class="flex flex-col justify-between h-full py-4 px-2">
    <div class="flex flex-col gap-1">
      <div class="px-2 pb-4">
        <ServiceLogo :collapsed="false" />
      </div>
      <UButton
        v-for="item in topItems"
        :key="item.to"
        :to="item.to"
        :icon="item.icon"
        :label="item.label"
        :variant="getVariant(item.to)"
        color="primary"
        block
        class="justify-start"
      />
    </div>
    <div class="flex flex-col gap-1">
      <UButton
        to="/login"
        icon="i-lucide-log-out"
        label="Выйти"
        variant="ghost"
        color="primary"
        block
        class="justify-start"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
const route = useRoute()
const { user } = useUserSession()

const topItems = computed(() => [
  ...(user.value?.role === 'admin' ? [{ label: 'Пользователи', icon: 'i-lucide-user-cog', to: '/users' }] : []),
  { label: 'Профиль',      icon: 'i-lucide-user',         to: '/profile' },
  { label: 'Семьи',        icon: 'i-lucide-users',        to: '/families' },
  { label: 'Рецепты',      icon: 'i-lucide-utensils',     to: '/recipes' },
  { label: 'Коллекции',    icon: 'i-lucide-folder-open',  to: '/collections' },
  { label: 'Меню',         icon: 'i-lucide-calendar-days',to: '/menu' },
  { label: 'Покупки',      icon: 'i-lucide-list-checks',  to: '/shopping' },
  { label: 'Продукты',     icon: 'i-lucide-package',      to: '/products' },
])

function getVariant(to: string): 'ghost' | 'solid' | 'soft' {
  if (route.path === to) return 'solid'
  if (route.path.startsWith(to + '/')) return 'soft'
  return 'ghost'
}
</script>
