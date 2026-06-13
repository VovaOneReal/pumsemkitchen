import type { Product } from '~~/app/types'
import type { CreateProductForm, UpdateProductForm } from '~~/schemas/product'

export const useProducts = () => {
  const products = useState<Product[]>('products', () => [])
  const loading = ref(false)

  const fetchProducts = async () => {
    if (products.value.length > 0) return // кеш-гард: не делать повторный запрос
    loading.value = true
    try {
      const [own, pub] = await Promise.all([
        $fetch<Product[]>('/api/products'),
        $fetch<Product[]>('/api/products/public'),
      ])
      // Собственные продукты приоритетны — перекрывают публичные с тем же id
      const ownIds = new Set(own.map(p => p.id))
      products.value = [...own, ...pub.filter(p => !ownIds.has(p.id))]
    } finally {
      loading.value = false
    }
  }

  const createProduct = async (body: CreateProductForm) => {
    const created = await $fetch<Product>('/api/products', { method: 'POST', body })
    products.value = [...products.value, created]
    return created
  }

  const updateProduct = async (id: number, body: UpdateProductForm) => {
    const updated = await $fetch<Product>(`/api/products/${id}`, { method: 'PATCH', body })
    products.value = products.value.map(p => (p.id === id ? updated : p))
    return updated
  }

  const deleteProduct = async (id: number) => {
    await $fetch(`/api/products/${id}`, { method: 'DELETE' })
    products.value = products.value.filter(p => p.id !== id)
  }

  return { products, loading, fetchProducts, createProduct, updateProduct, deleteProduct }
}
