import type { Product } from '~~/app/types'
import type { CreateProductForm, UpdateProductForm } from '~~/schemas/product'

export const useProducts = () => {
  const products = useState<Product[]>('products', () => [])

  const fetchProducts = async () => {
    products.value = await $fetch<Product[]>('/api/products')
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

  return { products, fetchProducts, createProduct, updateProduct }
}
