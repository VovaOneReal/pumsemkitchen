import type { Product } from '~~/app/types'
import type { CreateProductForm } from '~~/schemas/product'

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

  return { products, fetchProducts, createProduct }
}
