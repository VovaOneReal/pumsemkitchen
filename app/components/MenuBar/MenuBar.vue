<template>
  <div class="flex flex-col justify-between h-full py-4 px-2 w-64 flex-shrink-0">
    <div class="flex flex-col gap-1">
      <div class="px-2 pb-4">
        <ServiceLogo :collapsed="false" />
      </div>

      <!-- Выбор пространства: личное или семейное -->
      <UDropdownMenu :items="[]" class="pb-2">
        <UButton
          :label="activeWorkspace.label"
          trailing-icon="i-lucide-chevron-down"
          variant="ghost"
          color="neutral"
          block
          class="justify-between font-semibold"
        />
        <template #content>
          <div class="p-2 flex flex-col gap-1 min-w-48">
            <UInput
              v-model="searchWorkspace"
              placeholder="Поиск..."
              size="sm"
              :leading-icon="'i-lucide-search'"
              class="mb-1"
            />
            <div class="flex flex-col gap-0.5 max-h-56 overflow-y-auto">
              <button
                v-for="ws in filteredWorkspaceItems"
                :key="ws.id"
                class="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm hover:bg-elevated text-left w-full"
                :class="{ 'font-semibold': activeWorkspaceId === ws.id }"
                @click="activeWorkspaceId = ws.id"
              >
                <UIcon
                  :name="activeWorkspaceId === ws.id ? 'i-lucide-check' : 'i-lucide-circle'"
                  class="w-4 h-4 flex-shrink-0"
                  :class="activeWorkspaceId === ws.id ? 'text-primary' : 'text-transparent'"
                />
                {{ ws.label }}
              </button>
            </div>
          </div>
        </template>
      </UDropdownMenu>

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
const { families, fetchFamilies } = useFamilies()

onMounted(() => fetchFamilies())

const searchWorkspace = ref('')

// Личное пространство + семьи пользователя
const workspaceItems = computed(() => [
  { id: 'personal', label: 'Ваше пространство' },
  ...families.value.map((f) => ({ id: `family-${f.id}`, label: f.title })),
])

const filteredWorkspaceItems = computed(() =>
  workspaceItems.value.filter((w) => w.label.toLowerCase().includes(searchWorkspace.value.toLowerCase())),
)

const activeWorkspaceId = ref('personal')
const activeWorkspace = computed(
  () => workspaceItems.value.find((w) => w.id === activeWorkspaceId.value) ?? workspaceItems.value[0],
)

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await refreshSession()
  clearNuxtState()
  toast.add({ title: 'Вы вышли из системы', color: 'success' })
  await navigateTo('/login')
}

const topItems = computed(() => [
  ...(user.value?.role === 'admin'
    ? [
        // { label: 'Пользователи', icon: 'i-lucide-user-cog', to: '/users', disabled: true },
        // { label: 'Меры измерений',  icon: 'i-lucide-scale',    to: '/measurement-units' },
      ]
    : []),
  { label: 'Профиль', icon: 'i-lucide-user', to: '/profile' },
  { label: 'Семьи', icon: 'i-lucide-users', to: '/families' },
  { label: 'Рецепты', icon: 'i-lucide-utensils', to: '/recipes' },
  // { label: 'Коллекции', icon: 'i-lucide-folder-open', to: '/collections', disabled: true },
  { label: 'Меню', icon: 'i-lucide-calendar-days', to: '/menu' },
  { label: 'Покупки', icon: 'i-lucide-list-checks', to: '/shopping' },
  { label: 'Продукты', icon: 'i-lucide-package', to: '/products' },
])

function getVariant(to: string): 'ghost' | 'solid' | 'soft' {
  if (route.path === to) return 'solid'
  if (route.path.startsWith(to + '/')) return 'soft'
  return 'ghost'
}
</script>
