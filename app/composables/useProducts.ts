import type { Product } from '~~/app/types'
import type { CreateProductForm, UpdateProductForm } from '~~/schemas/product'

export const useProducts = () => {
  const products = useState<Product[]>('products', () => [])
  const loading = ref(false)

  const workspaceStore = useWorkspaceStore()

  const fetchProducts = async () => {
    if (products.value.length > 0) return // кеш-гард: не делать повторный запрос
    loading.value = true
    try {
      const query = workspaceStore.activeFamilyId ? { familyId: workspaceStore.activeFamilyId } : {}
      const [own, pub] = await Promise.all([
        $fetch<Product[]>('/api/products', { query }),
        $fetch<Product[]>('/api/products/public'),
      ])
      // Собственные/семейные продукты приоритетны — перекрывают публичные с тем же id
      const ownIds = new Set(own.map(p => p.id))
      products.value = [...own, ...pub.filter(p => !ownIds.has(p.id))]
    } finally {
      loading.value = false
    }
  }

  const createProduct = async (body: CreateProductForm) => {
    const fullBody = { ...body, family_id: workspaceStore.activeFamilyId ?? undefined }
    const created = await $fetch<Product>('/api/products', { method: 'POST', body: fullBody })
    products.value = [...products.value, created]
    return created
  }

  const updateProduct = async (id: number, body: UpdateProductForm) => {
    const updated = await $fetch<Product>(`/api/products/${id}`, { method: 'PATCH', body })
    // Мёрж сохраняет поля isOwn/isPublic из исходного объекта
    products.value = products.value.map(p => p.id === id ? { ...p, ...updated } : p)
    return updated
  }

  const deleteProduct = async (id: number) => {
    await $fetch(`/api/products/${id}`, { method: 'DELETE' })
    products.value = products.value.filter(p => p.id !== id)
  }

  return { products, loading, fetchProducts, createProduct, updateProduct, deleteProduct }
}
