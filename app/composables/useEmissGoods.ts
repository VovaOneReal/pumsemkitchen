import type { EmissGoodsItem } from '~/types'

export function useEmissGoods() {
  const goods = useState<EmissGoodsItem[]>('emiss-goods', () => [])

  async function fetchGoods() {
    goods.value = await $fetch<EmissGoodsItem[]>('/api/emiss/goods')
  }

  async function saveShowingFlags(updates: { id: number; is_showing_goods: boolean }[]) {
    await $fetch('/api/emiss/goods', {
      method: 'PATCH',
      body: { goods: updates },
    })
    // Обновляем локальный стейт
    for (const u of updates) {
      const item = goods.value.find((g) => g.id === u.id)
      if (item) item.isShowingGoods = u.is_showing_goods
    }
  }

  return { goods, fetchGoods, saveShowingFlags }
}
