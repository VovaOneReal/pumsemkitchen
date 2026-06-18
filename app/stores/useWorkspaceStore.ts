export const useWorkspaceStore = defineStore('workspace', () => {
  const activeWorkspaceId = ref<string>('personal')

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
