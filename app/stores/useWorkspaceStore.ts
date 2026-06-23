const COOKIE_KEY = 'activeWorkspaceId'

export const useWorkspaceStore = defineStore('workspace', () => {
  // useCookie читает cookie на сервере и клиенте — SSR-payload и гидратация совпадают
  const workspaceCookie = useCookie<string>(COOKIE_KEY, { default: () => 'personal', sameSite: 'lax' })

  const activeWorkspaceId = ref<string>(workspaceCookie.value)

  watch(activeWorkspaceId, (val) => {
    workspaceCookie.value = val
  })

  const activeFamilyId = computed((): number | null => {
    if (activeWorkspaceId.value === 'personal') return null
    return Number(activeWorkspaceId.value.replace('family-', ''))
  })

  async function selectWorkspace(id: string) {
    activeWorkspaceId.value = id
    // Очищаем только кеш сущностей, зависящих от пространства
    clearNuxtState(['recipes', 'currentRecipe', 'menus', 'shoppingLists', 'products'])
    await navigateTo('/')
  }

  return { activeWorkspaceId, activeFamilyId, selectWorkspace }
})
