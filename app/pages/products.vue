<template>
  <div class="flex flex-col w-full px-2 gap-4">
    <div class="flex items-center justify-between w-full">
      <h2 class="ui-header-2">Продукты</h2>
      <UButton leading-icon="i-lucide-plus" label="Создать" @click="openCreate" />
    </div>

    <UInput
      v-model="searchQuery"
      placeholder="Название..."
      class="w-64"
      :trailing-icon="'i-lucide-search'"
    />

    <UTable :data="filteredProducts" :columns="columns" :empty="emptyText">
      <template #image-cell="{ row }">
        <img
          :src="row.original.image ?? 'https://placehold.co/40x40'"
          alt=""
          class="w-10 h-10 rounded-md object-cover"
        />
      </template>

      <template #name-cell="{ row }">
        <button
          class="text-left hover:text-primary transition-colors"
          @click="openView(row.original)"
        >
          {{ row.original.name }}
        </button>
      </template>

      <template #actions-cell="{ row }">
        <div class="flex gap-1">
          <UButton
            icon="i-lucide-pencil"
            variant="subtle"
            color="primary"
            size="sm"
            @click="openEdit(row.original)"
          />
          <UButton
            icon="i-lucide-trash-2"
            variant="subtle"
            color="error"
            size="sm"
            @click="confirmDelete(row.original)"
          />
        </div>
      </template>
    </UTable>

    <!-- Диалог просмотра карточки продукта -->
    <UModal v-model:open="showViewModal" :ui="{ content: 'sm:max-w-3xl' }">
      <template #content>
        <div class="p-6 flex flex-col gap-5">
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-semibold">Карточка продукта</h3>
            <UButton
              icon="i-lucide-x"
              variant="ghost"
              color="neutral"
              size="sm"
              @click="showViewModal = false"
            />
          </div>

          <div class="flex gap-6">
            <!-- Изображение и кнопки действий -->
            <div class="flex flex-col gap-3 shrink-0">
              <!-- TODO: изображение продукта
              <AppImage
                :src="selectedProduct?.image ?? undefined"
                :placeholder="!selectedProduct?.image"
                :width="192"
                :height="192"
                class="w-48 h-48 rounded-lg"
              />
              -->
              <div class="flex gap-2">
                <UButton
                  label="Редактировать"
                  icon="i-lucide-pencil"
                  color="primary"
                  variant="soft"
                  class="flex-1"
                  @click="openEditFromView"
                />
                <UButton
                  icon="i-lucide-trash-2"
                  color="error"
                  variant="soft"
                  @click="openDeleteFromView"
                />
              </div>
            </div>

            <!-- Информация о продукте -->
            <div class="flex flex-col gap-4 flex-1 min-w-0">
              <div class="flex flex-col gap-2">
                <p class="text-lg font-bold">{{ selectedProduct?.name }}</p>
                <!-- Бейджи: доступность, автор, даты -->
                <div class="flex items-center gap-2 flex-wrap">
                  <UBadge
                    :label="(selectedProduct?.isPublic ?? true) ? 'Публичный' : 'Приватный'"
                    :icon="(selectedProduct?.isPublic ?? true) ? 'i-lucide-globe' : 'i-lucide-lock'"
                    variant="subtle"
                    :color="(selectedProduct?.isPublic ?? true) ? 'success' : 'neutral'"
                  />
                  <UBadge
                    :label="selectedProduct?.authorName ?? 'admin'"
                    icon="i-lucide-user"
                    variant="subtle"
                    color="neutral"
                  />
                  <UBadge
                    :label="selectedProduct?.createdAt ?? '20-10-2026'"
                    icon="i-lucide-calendar"
                    variant="subtle"
                    color="neutral"
                  />
                  <UBadge
                    :label="selectedProduct?.modifierName ?? 'admin'"
                    icon="i-lucide-user"
                    variant="subtle"
                    color="neutral"
                  />
                  <UBadge
                    :label="selectedProduct?.updatedAt ?? '21-10-2026'"
                    icon="i-lucide-calendar"
                    variant="subtle"
                    color="neutral"
                  />
                </div>
              </div>

              <!-- Две колонки: пищевая ценность | конвертация + стоимость -->
              <div class="grid grid-cols-2 gap-6">
                <!-- Пищевая ценность -->
                <div class="flex flex-col gap-2">
                  <p class="font-semibold text-sm">Пищевая ценность</p>
                  <p v-if="selectedProduct?.nutritionsFromProductName" class="text-xs text-primary">
                    Указаны значения из продукта {{ selectedProduct.nutritionsFromProductName }}
                  </p>
                  <p class="text-xs text-gray-500">на 100 г продукта</p>
                  <div class="flex flex-col gap-1 text-sm">
                    <div class="flex justify-between gap-4">
                      <span class="text-gray-700">Белки</span>
                      <span>{{ selectedProduct?.protein }} г</span>
                    </div>
                    <div class="flex justify-between gap-4">
                      <span class="text-gray-700">Жиры</span>
                      <span>{{ selectedProduct?.fat }} г</span>
                    </div>
                    <div class="flex justify-between gap-4">
                      <span class="text-gray-700">Углеводы</span>
                      <span>{{ selectedProduct?.carbs }} г</span>
                    </div>
                  </div>
                </div>

                <!-- Конвертация + Стоимость -->
                <div class="flex flex-col gap-4">
                  <div class="flex flex-col gap-1">
                    <p class="font-semibold text-sm">Конвертация</p>
                    <p class="text-sm">{{ viewConversionText }}</p>
                  </div>
                  <div class="flex flex-col gap-1">
                    <p class="font-semibold text-sm">Стоимость</p>
                    <p v-if="selectedProduct?.priceFromProductName" class="text-xs text-primary">
                      Указана стоимость из публичного продукта
                      {{ selectedProduct.priceFromProductName }}
                    </p>
                    <p class="text-sm">
                      {{ selectedProduct?.priceRub }} ₽
                      <span class="text-gray-500"
                        >&nbsp;за {{ selectedProduct?.priceQty }}
                        {{ selectedProduct?.priceUnit }}.</span
                      >
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </UModal>

    <!-- Диалог редактирования / создания продукта -->
    <UModal
      v-model:open="showEditModal"
      :dismissible="false"
      :ui="{ content: 'sm:max-w-[calc(100vw-2rem)]' }"
    >
      <template #content>
        <UForm
          :schema="activeSchema"
          :state="editForm"
          class="p-6 flex flex-col gap-5"
          @submit="onFormSubmit"
        >
          <h3 class="text-xl font-semibold">
            {{ editingProduct ? 'Изменение продукта' : 'Создание продукта' }}
          </h3>

          <div class="flex gap-6">
            <!-- TODO: загрузка изображения
            <div class="shrink-0">
              <AppImageUpload v-model="editForm.image" class="w-48 h-48" />
            </div>
            -->

            <!-- Поля формы -->
            <div class="flex flex-col gap-4 flex-1">
              <UFormField name="title" label="Название продукта" required>
                <UInput
                  v-model="editForm.title"
                  placeholder="Название продукта"
                  :maxlength="32"
                  class="w-full"
                />
              </UFormField>

              <!-- Две колонки: питательность + стоимость | конвертация + доступность -->
              <div class="grid grid-cols-2 gap-6">
                <!-- Левая колонка: пищевая ценность + стоимость -->
                <div class="flex flex-col gap-4">
                  <!-- Пищевая ценность -->
                  <div class="flex flex-col gap-2">
                    <p class="font-semibold text-sm">Пищевая ценность</p>
                    <p class="text-xs text-gray-500">на 100 г продукта</p>
                    <div class="flex items-center justify-between gap-2 text-sm">
                      <span class="shrink-0">Использовать из публичного продукта</span>
                      <USelectMenu
                        v-model="editForm.nutritions_from_product_id"
                        :items="nutritionItems"
                        :loading="publicProductsLoading"
                        searchable
                        placeholder="Свои значения"
                        class="w-40"
                        :searchInput="{ placeholder: 'Поиск...', variant: 'none' }"
                        @update:open="(open: boolean) => open && fetchPublicProducts()"
                      />
                    </div>
                    <UFormField
                      name="proteins"
                      class="flex items-center justify-between gap-2"
                    >
                      <template #label>
                        <span class="text-sm">Белки (г)</span>
                      </template>
                      <UInputNumber
                        v-model="editForm.proteins"
                        :step="0.1"
                        :min="0"
                        :format-options="{ useGrouping: false, maximumFractionDigits: 1 }"
                        class="w-36"
                      />
                    </UFormField>
                    <UFormField name="fats" class="flex items-center justify-between gap-2">
                      <template #label>
                        <span class="text-sm">Жиры (г)</span>
                      </template>
                      <UInputNumber
                        v-model="editForm.fats"
                        :step="0.1"
                        :min="0"
                        :format-options="{ useGrouping: false, maximumFractionDigits: 1 }"
                        class="w-36"
                      />
                    </UFormField>
                    <UFormField name="carbs" class="flex items-center justify-between gap-2">
                      <template #label>
                        <span class="text-sm">Углеводы (г)</span>
                      </template>
                      <UInputNumber
                        v-model="editForm.carbs"
                        :step="0.1"
                        :min="0"
                        :format-options="{ useGrouping: false, maximumFractionDigits: 1 }"
                        class="w-36"
                      />
                    </UFormField>
                    <div class="flex items-center justify-between gap-2 text-sm text-gray-500">
                      <span>Калории</span>
                      <span class="w-36 text-center">{{ editCalories }}</span>
                    </div>
                  </div>

                  <!-- Стоимость -->
                  <div class="flex flex-col gap-2">
                    <p class="font-semibold text-sm">Стоимость</p>
                    <div class="flex items-center justify-between gap-2 text-sm">
                      <span class="shrink-0">Использовать из публичного продукта</span>
                      <USelectMenu
                        v-model="editForm.price_from_product_id"
                        :items="priceItems"
                        :loading="publicProductsLoading"
                        searchable
                        placeholder="Свои значения"
                        :searchInput="{ placeholder: 'Поиск...', variant: 'none' }"
                        class="w-40"
                        @update:open="(open: boolean) => open && fetchPublicProducts()"
                      />
                    </div>
                    <div class="flex items-center gap-2 flex-wrap">
                      <UFormField name="user_price">
                        <UInputNumber
                          v-model="editForm.user_price"
                          :step="0.01"
                          :min="0"
                          :format-options="{ useGrouping: false, maximumFractionDigits: 2 }"
                          class="w-28"
                        />
                      </UFormField>
                      <span class="text-sm shrink-0">₽ за</span>
                      <UFormField name="quantity_per_price">
                        <UInputNumber
                          v-model="editForm.quantity_per_price"
                          :step="0.1"
                          :min="0"
                          :format-options="{ useGrouping: false, maximumFractionDigits: 1 }"
                          class="w-24"
                        />
                      </UFormField>
                      <UFormField name="measurement_unit_id">
                        <USkeleton v-if="measurementsLoading" class="h-8 w-32 rounded-md" />
                        <USelect
                          v-else
                          v-model="editForm.measurement_unit_id"
                          :items="filteredMeasurementItems"
                          placeholder="Выберите меру..."
                          class="w-48"
                        />
                      </UFormField>
                    </div>
                  </div>
                </div>

                <!-- Правая колонка: конвертация + доступность -->
                <div class="flex flex-col gap-4">
                  <!-- Конвертация -->
                  <div class="flex flex-col gap-3">
                    <p class="font-semibold text-sm">Конвертация</p>
                    <p class="text-xs text-gray-500">
                      Укажите, как соотносятся меры измерения для этого продукта. По умолчанию —
                      счёт в граммах.
                    </p>
                    <div class="flex gap-4">
                      <UCheckbox v-model="specifyVolume" label="Указать объём" />
                      <UCheckbox v-model="specifyPieces" label="Указать штуки" />
                    </div>
                    <!-- Поля конвертации (только при выбранных галочках) -->
                    <div v-if="specifyVolume || specifyPieces" class="flex items-end gap-2">
                      <UFormField required name="g_measure" label="Граммы" class="flex-1">
                        <UInputNumber
                          v-model="editForm.g_measure"
                          :min="1"
                          :format-options="{ useGrouping: false }"
                          class="w-full"
                        />
                      </UFormField>
                      <template v-if="specifyVolume">
                        <span class="pb-2 text-sm font-medium">=</span>
                        <UFormField required name="ml_measure" label="Миллилитры" class="flex-1">
                          <UInputNumber
                            v-model="editForm.ml_measure"
                            :min="1"
                            :format-options="{ useGrouping: false }"
                            class="w-full"
                          />
                        </UFormField>
                      </template>
                      <template v-if="specifyPieces">
                        <span class="pb-2 text-sm font-medium">=</span>
                        <UFormField required name="pcs_measure" label="Штуки" class="flex-1">
                          <UInputNumber
                            v-model="editForm.pcs_measure"
                            :min="1"
                            :format-options="{ useGrouping: false }"
                            class="w-full"
                          />
                        </UFormField>
                      </template>
                    </div>
                  </div>

                  <!-- Доступность -->
                  <div class="flex flex-col gap-2">
                    <p class="font-semibold text-sm">Доступность</p>
                    <UButtonGroup v-if="isAdmin">
                      <UButton
                        icon="i-lucide-lock"
                        label="Приватный"
                        :variant="!editForm.is_public ? 'solid' : 'outline'"
                        color="neutral"
                        @click="editForm.is_public = false"
                      />
                      <UButton
                        icon="i-lucide-globe"
                        label="Публичный"
                        :variant="editForm.is_public ? 'solid' : 'outline'"
                        color="neutral"
                        @click="editForm.is_public = true"
                      />
                    </UButtonGroup>
                    <p v-else class="text-sm text-gray-500">Продукт будет доступен только вам.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-2">
            <UButton
              type="button"
              variant="ghost"
              color="error"
              label="Отменить"
              @click="cancelEdit"
            />
            <UButton type="submit" label="Сохранить" :loading="saving" />
          </div>
        </UForm>
      </template>
    </UModal>

    <!-- Диалог подтверждения удаления -->
    <UModal v-model:open="showDeleteModal">
      <template #content>
        <div class="p-6 flex flex-col gap-4">
          <h3 class="text-lg font-semibold">Подтвердите удаление</h3>
          <p class="text-sm text-gray-600">
            Вы точно хотите удалить продукт {{ productToDelete?.name }}?
          </p>
          <div class="flex justify-end gap-2">
            <UButton
              variant="ghost"
              color="primary"
              label="Отменить"
              @click="showDeleteModal = false"
            />
            <UButton color="error" label="Удалить" @click="onDeleteConfirm" />
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script lang="ts" setup>
useHead({ title: 'Продукты' })
import { z } from 'zod'
import type { TableColumn } from '@nuxt/ui'
import type { Product } from '~/app/types'
import { productFormSchema } from '~~/schemas/product'

interface EditForm {
  image: string | null
  title: string
  proteins: number | null
  fats: number | null
  carbs: number | null
  user_price: number | null
  quantity_per_price: number | null
  measurement_unit_id: number | null
  is_public: boolean
  nutritions_from_product_id: number | null
  price_from_product_id: number | null
  g_measure: number
  ml_measure: number | null
  pcs_measure: number | null
}

const { user } = useUserSession()
const isAdmin = computed(() => user.value?.role === 'admin')

const toast = useToast()

const searchQuery = ref('')
const fetchingProducts = ref(false)
const showViewModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const saving = ref(false)
const specifyVolume = ref(false)
const specifyPieces = ref(false)
const selectedProduct = ref<Product | null>(null)
const editingProduct = ref<Product | null>(null)
const productToDelete = ref<Product | null>(null)

const editForm = ref<EditForm>({
  image: null,
  title: '',
  proteins: 0,
  fats: 0,
  carbs: 0,
  user_price: 0,
  quantity_per_price: 0,
  measurement_unit_id: null,
  is_public: false,
  nutritions_from_product_id: null,
  price_from_product_id: null,
  g_measure: 100,
  ml_measure: 100,
  pcs_measure: 1,
})

const { products, fetchProducts, createProduct, updateProduct, deleteProduct } = useProducts()
const {
  loading: publicProductsLoading,
  fetchPublicProducts,
  nutritionItems,
  priceItems,
} = usePublicProducts()
const { measurements, loading: measurementsLoading, fetchMeasurements } = useMeasurements()

function calcCalories(protein: number, fat: number, carbs: number): number {
  return Math.round((4 * protein + 9 * fat + 4 * carbs) * 10) / 10
}

const editCalories = computed(() =>
  calcCalories(
    editForm.value.proteins ?? 0,
    editForm.value.fats ?? 0,
    editForm.value.carbs ?? 0,
  ),
)

const viewConversionText = computed(() => {
  if (!selectedProduct.value) return '100 г = 100 мл = 1 шт'
  const g = selectedProduct.value.conversionGrams ?? 100
  const parts: string[] = [`${g} г`]
  if (selectedProduct.value.conversionMl != null)
    parts.push(`${selectedProduct.value.conversionMl} мл`)
  else parts.push('100 мл')
  if (selectedProduct.value.conversionPieces != null)
    parts.push(`${selectedProduct.value.conversionPieces} шт`)
  else parts.push('1 шт')
  return parts.join(' = ')
})

// Список единиц для раздела "Стоимость" — фильтруется по выбранным галочкам конвертации
const filteredMeasurementItems = computed(() => {
  const allowedTypes = new Set(['weight'])
  if (specifyVolume.value) allowedTypes.add('volume')
  if (specifyPieces.value) allowedTypes.add('piece')
  return measurements.value
    .filter((m) => allowedTypes.has(m.measure_type))
    .map((m) => ({ label: m.unit_name, value: m.measurement_unit_id }))
})

// Сбросить единицу если она исчезла из фильтра
watch(filteredMeasurementItems, (items) => {
  if (
    editForm.value.measurement_unit_id !== null &&
    !items.some((i) => i.value === editForm.value.measurement_unit_id)
  ) {
    editForm.value.measurement_unit_id = null
  }
})

// Схема расширяется динамически: показанные поля конвертации обязательны
const activeSchema = computed(() => {
  if (!specifyVolume.value && !specifyPieces.value) return productFormSchema
  return productFormSchema.extend({
    g_measure: z.number({ error: 'Введите значение' }).min(1),
    ...(specifyVolume.value && { ml_measure: z.number({ error: 'Введите значение' }).min(1) }),
    ...(specifyPieces.value && {
      pcs_measure: z.number({ error: 'Введите значение' }).min(1),
    }),
  })
})

const emptyText = computed(() =>
  fetchingProducts.value
    ? 'Ищем продукты, подождите...'
    : 'Пока что продуктов нет. Вы можете создать новый по кнопке «Создать».',
)

onMounted(async () => {
  fetchingProducts.value = true
  try {
    await fetchProducts()
  } finally {
    fetchingProducts.value = false
  }
})

const columns: TableColumn<Product>[] = [
  { id: 'image', header: '' },
  { accessorKey: 'name', header: 'Название' },
  {
    accessorKey: 'priceRub',
    header: 'Стоимость',
    cell: ({ row }) => `${row.original.priceRub} ₽`,
  },
  {
    id: 'priceFor',
    header: 'за',
    cell: ({ row }) => `${row.original.priceQty} ${row.original.priceUnit}.`,
  },
  { accessorKey: 'protein', header: 'Белки' },
  { accessorKey: 'fat', header: 'Жиры' },
  { accessorKey: 'carbs', header: 'Углеводы' },
  {
    id: 'calories',
    header: 'Калории',
    cell: ({ row }) => calcCalories(row.original.protein, row.original.fat, row.original.carbs),
  },
  { id: 'actions', header: 'Действия' },
]

const filteredProducts = computed(() =>
  products.value.filter((p) => p.name.toLowerCase().includes(searchQuery.value.toLowerCase())),
)

function openView(product: Product) {
  selectedProduct.value = product
  showViewModal.value = true
}

function openCreate() {
  editingProduct.value = null
  editForm.value = {
    image: null,
    title: '',
    proteins: 0,
    fats: 0,
    carbs: 0,
    user_price: 0,
    quantity_per_price: 0,
    measurement_unit_id: null,
    is_public: false,
    nutritions_from_product_id: null,
    price_from_product_id: null,
    g_measure: 100,
    ml_measure: 100,
    pcs_measure: 1,
  }
  specifyVolume.value = false
  specifyPieces.value = false
  fetchMeasurements()
  showEditModal.value = true
}

async function openEdit(product: Product) {
  editingProduct.value = product
  editForm.value = {
    image: product.image,
    title: product.name,
    proteins: product.protein,
    fats: product.fat,
    carbs: product.carbs,
    user_price: product.priceRub,
    quantity_per_price: product.priceQty,
    measurement_unit_id: null,
    is_public: product.isPublic ?? false,
    nutritions_from_product_id: null,
    price_from_product_id: null,
    g_measure: product.conversionGrams ?? 100,
    ml_measure: product.conversionMl ?? 100,
    pcs_measure: product.conversionPieces ?? 1,
  }
  specifyVolume.value = product.conversionMl != null
  specifyPieces.value = product.conversionPieces != null
  await fetchMeasurements()
  const unit = measurements.value.find((m) => m.unit_name === product.priceUnit)
  editForm.value.measurement_unit_id = unit?.measurement_unit_id ?? null
  showEditModal.value = true
}

async function openEditFromView() {
  if (!selectedProduct.value) return
  showViewModal.value = false
  await openEdit(selectedProduct.value)
}

function openDeleteFromView() {
  if (!selectedProduct.value) return
  productToDelete.value = selectedProduct.value
  showViewModal.value = false
  showDeleteModal.value = true
}

function confirmDelete(product: Product) {
  productToDelete.value = product
  showDeleteModal.value = true
}

async function onDeleteConfirm() {
  if (!productToDelete.value) return
  try {
    await deleteProduct(productToDelete.value.id)
    toast.add({ title: 'Продукт удалён', color: 'success' })
  } catch {
    toast.add({ title: 'Ошибка при удалении продукта', color: 'error' })
  }
  showDeleteModal.value = false
  productToDelete.value = null
}

function cancelEdit() {
  showEditModal.value = false
  editingProduct.value = null
}

async function onFormSubmit() {
  saving.value = true
  try {
    const body = {
      title: editForm.value.title,
      proteins: editForm.value.proteins!,
      fats: editForm.value.fats!,
      carbs: editForm.value.carbs!,
      user_price: editForm.value.user_price!,
      quantity_per_price: editForm.value.quantity_per_price!,
      measurement_unit_id: editForm.value.measurement_unit_id!,
      // Поля конвертации передаются только при активных галочках
      ...(specifyVolume.value || specifyPieces.value ? { g_measure: editForm.value.g_measure } : {}),
      ...(specifyVolume.value ? { ml_measure: editForm.value.ml_measure ?? undefined } : {}),
      ...(specifyPieces.value ? { pcs_measure: editForm.value.pcs_measure ?? undefined } : {}),
    }
    if (editingProduct.value) {
      await updateProduct(editingProduct.value.id, body)
      toast.add({ title: 'Продукт обновлён', color: 'success' })
    } else {
      await createProduct(body)
      toast.add({ title: 'Продукт создан', color: 'success' })
    }
  } catch {
    toast.add({
      title: editingProduct.value
        ? 'Ошибка при обновлении продукта'
        : 'Ошибка при создании продукта',
      color: 'error',
    })
    return
  } finally {
    saving.value = false
  }
  showEditModal.value = false
  editingProduct.value = null
}
</script>
