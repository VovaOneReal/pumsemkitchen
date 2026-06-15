<template>
  <div class="flex w-full gap-2 items-center">
    <DragElement />

    <!-- Выбор продукта с поиском -->
    <UInputMenu
      class="flex-1"
      placeholder="Введите название ингредиента..."
      :items="productItems"
      :loading="productsLoading"
      v-model="selectedProduct"
    />

    <UInput class="w-32" type="text" placeholder="Примечание" v-model="note" />

    <UInputNumber
      :disabled="isOptional"
      orientation="horizontal"
      class="w-28"
      :min="0"
      :step="0.1"
      v-model="amount"
    />

    <!-- Выбор единицы измерения из API -->
    <USkeleton v-if="measurementsLoading" class="h-8 w-24 rounded-md" />
    <USelect
      v-else
      :disabled="isOptional"
      :items="measurementItems"
      v-model="selectedMeasurementUnitId"
      class="w-24"
    />

    <UCheckbox v-model="isOptional" label="По вкусу" />
    <UButton color="error" variant="ghost" square @click="$emit('delete', id)">
      <X />
    </UButton>
  </div>
</template>

<script lang="ts" setup>
import { X } from 'lucide-vue-next'
import type { ModelRef } from 'vue'
import DragElement from './DragElement.vue'

const emit = defineEmits(['delete'])

const props = defineProps({
  id: Number,
})
const id = props.id

const productId: ModelRef<number | null | undefined> = defineModel('productId')
const note: ModelRef<string | undefined> = defineModel('note')
const isOptional: ModelRef<boolean | undefined> = defineModel('isOptional')
const amount: ModelRef<number | undefined> = defineModel('amount')
const measurementUnitId: ModelRef<number | null | undefined> = defineModel('measurementUnitId')

const { products, loading: productsLoading, fetchProducts } = useProducts()
const { measurements, loading: measurementsLoading, fetchMeasurements } = useMeasurements()

onMounted(() => Promise.all([fetchProducts(), fetchMeasurements()]))

const productItems = computed(() =>
  products.value.map((p) => ({ label: p.name, value: p.id }))
)

// UInputMenu работает с объектом { label, value }, поэтому проксируем через computed
const selectedProduct = computed({
  get() {
    if (productId.value == null) return undefined
    return productItems.value.find((item) => item.value === productId.value)
  },
  set(item: { label: string; value: number } | undefined) {
    // Сбрасываем единицу измерения при смене продукта
    if ((item?.value ?? null) !== productId.value) {
      measurementUnitId.value = null
    }
    productId.value = item?.value ?? null
  },
})

const selectedProductData = computed(() =>
  products.value.find((p) => p.id === productId.value) ?? null
)

const measurementItems = computed(() => {
  const p = selectedProductData.value
  const allowedTypes = new Set<string>(['weight'])
  if (p?.mlMeasure != null) { allowedTypes.add('volume'); allowedTypes.add('volume_extra') }
  if (p?.pcsMeasure != null) allowedTypes.add('piece')
  return measurements.value
    .filter((m) => allowedTypes.has(m.measure_type))
    .map((m) => ({ label: m.unit_abbr, value: m.measurement_unit_id }))
})

const selectedMeasurementUnitId = computed({
  get() {
    return measurementUnitId.value ?? null
  },
  set(v: number | null) {
    measurementUnitId.value = v
  },
})

// При включении "по вкусу" фиксируем количество = 0 и единицу = стандартный грамм
watch(isOptional, (val) => {
  if (!val) return
  amount.value = 0
  const gram = measurements.value.find((m) => m.measure_type === 'weight' && m.is_standart)
  if (gram) measurementUnitId.value = gram.measurement_unit_id
})
</script>
