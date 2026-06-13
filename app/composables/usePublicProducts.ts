export type PublicProduct = {
  id: number
  name: string
  nutritions_from_product_id: number | null
  price_from_product_id: number | null
}

const NO_VALUE = { label: 'Свои значения', value: null as number | null }

export const usePublicProducts = () => {
  const products = useState<PublicProduct[]>('publicProducts', () => [])
  const loading = ref(false)

  const fetchPublicProducts = async () => {
    if (products.value.length > 0) return
    loading.value = true
    try {
      products.value = await $fetch<PublicProduct[]>('/api/products/public')
    } finally {
      loading.value = false
    }
  }

  const nutritionItems = computed(() => [
    NO_VALUE,
    ...products.value
      .filter(p => p.nutritions_from_product_id != null)
      .map(p => ({ label: p.name, value: p.id as number | null })),
  ])

  const priceItems = computed(() => [
    NO_VALUE,
    ...products.value
      .filter(p => p.price_from_product_id != null)
      .map(p => ({ label: p.name, value: p.id as number | null })),
  ])

  return { loading, fetchPublicProducts, nutritionItems, priceItems }
}
