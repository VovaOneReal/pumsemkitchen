import type { Menu } from '~~/app/types'
import type { MenuForm, UpdateMenuForm } from '~~/schemas/menu'

export const useMenus = () => {
  const menus = useState<Menu[]>('menus', () => [])
  const loading = ref(false)

  const fetchMenus = async () => {
    loading.value = true
    try {
      menus.value = await $fetch<Menu[]>('/api/menus')
    } finally {
      loading.value = false
    }
  }

  const createMenu = async (body: MenuForm) => {
    const created = await $fetch<Menu>('/api/menus', { method: 'POST', body })
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

  return { menus, loading, fetchMenus, createMenu, updateMenu, deleteMenu }
}
