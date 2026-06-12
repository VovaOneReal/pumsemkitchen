<template>
  <div class="flex flex-col justify-between h-full py-4 px-2 w-64 flex-shrink-0">
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
        :disabled="item.disabled"
        color="primary"
        block
        class="justify-start"
      />
    </div>
    <div class="flex flex-col gap-1">
      <UButton
        icon="i-lucide-circle-help"
        label="Справка"
        :variant="getVariant('/help')"
        color="primary"
        block
        class="justify-start"
        to="/help"
      />
      <UButton
        icon="i-lucide-log-out"
        label="Выйти"
        variant="ghost"
        color="primary"
        block
        class="justify-start"
        @click="logout"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
const route = useRoute()
const { user, fetch: refreshSession } = useUserSession()
const toast = useToast()

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await refreshSession()
  toast.add({ title: 'Вы вышли из системы', color: 'success' })
  await navigateTo('/login')
}

const topItems = computed(() => [
  ...(user.value?.role === 'admin'
    ? [
        { label: 'Пользователи', icon: 'i-lucide-user-cog', to: '/users', disabled: true },
        // { label: 'Меры измерений',  icon: 'i-lucide-scale',    to: '/measurement-units' },
      ]
    : []),
  { label: 'Профиль', icon: 'i-lucide-user', to: '/profile' },
  { label: 'Семьи', icon: 'i-lucide-users', to: '/families', disabled: true },
  { label: 'Рецепты', icon: 'i-lucide-utensils', to: '/recipes' },
  { label: 'Коллекции', icon: 'i-lucide-folder-open', to: '/collections', disabled: true },
  { label: 'Меню', icon: 'i-lucide-calendar-days', to: '/menu', disabled: true },
  { label: 'Покупки', icon: 'i-lucide-list-checks', to: '/shopping', disabled: true },
  { label: 'Продукты', icon: 'i-lucide-package', to: '/products' },
])

function getVariant(to: string): 'ghost' | 'solid' | 'soft' {
  if (route.path === to) return 'solid'
  if (route.path.startsWith(to + '/')) return 'soft'
  return 'ghost'
}
</script>
