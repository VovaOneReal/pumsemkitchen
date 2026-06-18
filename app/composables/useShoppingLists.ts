import type { ShoppingList } from '@/types'

export const useShoppingLists = () => {
  const lists = useState<ShoppingList[]>('shoppingLists', () => [])
  const loading = ref(false)
  const creating = ref(false)
  const deletingId = ref<number | null>(null)
  const editingId = ref<number | null>(null)

  const workspaceStore = useWorkspaceStore()

  const fetchLists = async () => {
    loading.value = true
    try {
      const query = workspaceStore.activeFamilyId ? { familyId: workspaceStore.activeFamilyId } : {}
      lists.value = await $fetch<ShoppingList[]>('/api/shopping-lists', { query })
    } finally {
      loading.value = false
    }
  }

  const createList = async (title: string) => {
    creating.value = true
    try {
      const body: Record<string, unknown> = { title }
      if (workspaceStore.activeFamilyId) body.family_id = workspaceStore.activeFamilyId
      const created = await $fetch<ShoppingList>('/api/shopping-lists', { method: 'POST', body })
      lists.value.unshift(created)
      return created
    } finally {
      creating.value = false
    }
  }

  const updateList = async (id: number, title: string) => {
    editingId.value = id
    try {
      const updated = await $fetch<ShoppingList>(`/api/shopping-lists/${id}`, { method: 'PATCH', body: { title } })
      const idx = lists.value.findIndex((l) => l.id === id)
      if (idx !== -1) lists.value[idx] = updated
      return updated
    } finally {
      editingId.value = null
    }
  }

  const deleteList = async (id: number) => {
    deletingId.value = id
    try {
      await $fetch(`/api/shopping-lists/${id}`, { method: 'DELETE' })
      lists.value = lists.value.filter((l) => l.id !== id)
    } finally {
      deletingId.value = null
    }
  }

  const fetchList = async (id: number) => {
    return await $fetch<ShoppingList>(`/api/shopping-lists/${id}`)
  }

  return { lists, loading, creating, deletingId, editingId, fetchLists, createList, updateList, deleteList, fetchList }
}
