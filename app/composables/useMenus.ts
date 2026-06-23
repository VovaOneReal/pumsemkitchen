import type { Menu } from '~~/app/types'
import type { MenuForm, UpdateMenuForm } from '~~/schemas/menu'

export const useMenus = () => {
  const menus = useState<Menu[]>('menus', () => [])
  const loading = ref(false)

  const workspaceStore = useWorkspaceStore()

  const fetchMenus = async () => {
    loading.value = true
    try {
      const query = workspaceStore.activeFamilyId ? { familyId: workspaceStore.activeFamilyId } : {}
      menus.value = await $fetch<Menu[]>('/api/menus', { query })
    } finally {
      loading.value = false
    }
  }

  const createMenu = async (body: MenuForm) => {
    const created = await $fetch<Menu>('/api/menus', {
      method: 'POST',
      body: { ...body, family_id: workspaceStore.activeFamilyId ?? undefined },
    })
    menus.value = [created, ...menus.value]
    return created
  }

  const updateMenu = async (id: number, body: UpdateMenuForm) => {
    const updated = await $fetch<Menu>(`/api/menus/${id}`, { method: 'PATCH', body })
    menus.value = menus.value.map((m) => (m.id === id ? updated : m))
    return updated
  }

  const deleteMenu = async (id: number) => {
    await $fetch(`/api/menus/${id}`, { method: 'DELETE' })
    menus.value = menus.value.filter((m) => m.id !== id)
  }

  const createMenuShoppingList = async (id: number): Promise<{ id: number; title: string }> =>
    $fetch(`/api/menus/${id}/shopping-list`, { method: 'POST' })

  type GenerateWarnings = {
    budgetExceeded: boolean
    actualCost: number | null
    calorieDeviation: boolean
    dayRepeat: boolean
  }

  type GenerateMenuBody = {
    title: string
    dateFrom: string
    dateTo: string
    numberOfPeople: number
    targetCaloriesPerDay: number
    totalBudget: number | null
    selectedMeals: string[]
  }

  const generateMenu = async (body: GenerateMenuBody): Promise<{ menuId: number; warnings: GenerateWarnings }> =>
    $fetch('/api/menus/generate', {
      method: 'POST',
      body: { ...body, familyId: workspaceStore.activeFamilyId ?? undefined },
    })

  return { menus, loading, fetchMenus, createMenu, updateMenu, deleteMenu, createMenuShoppingList, generateMenu }
}
