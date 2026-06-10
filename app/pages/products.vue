<template>
  <div class="flex flex-col w-full px-2 gap-4">
    <div class="flex items-center justify-between w-full">
      <h2 class="ui-header-2">Продукты</h2>
      <UButton label="+ Создать" @click="openCreate" />
    </div>

    <UInput
      v-model="searchQuery"
      placeholder="Название..."
      class="w-64"
      :trailing-icon="'i-lucide-search'"
    />

    <UTable :data="filteredProducts" :columns="columns" empty="Нет данных">
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
    <UModal v-model:open="showViewModal" :ui="{ content: 'sm:max-w-2xl' }">
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
              <AppImage
                :src="selectedProduct?.image ?? undefined"
                :placeholder="!selectedProduct?.image"
                :width="200"
                :height="200"
                class="w-48 h-48 rounded-lg"
              />
              <div class="flex gap-2">
                <UButton
                  label="Редактирование"
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
            <div class="flex flex-col gap-4 flex-1">
              <p class="text-lg font-bold">{{ selectedProduct?.name }}</p>

              <div class="flex flex-col gap-4">
                <!-- Пищевая ценность -->
                <div class="flex flex-col gap-2 w-full">
                  <p class="font-semibold text-sm">Пищевая ценность (на 100 г продукта)</p>
                  <div class="flex flex-col gap-1 text-sm">
                    <div class="flex gap-6">
                      <span class="w-20">Белки</span>
                      <span>{{ selectedProduct?.protein }} г</span>
                    </div>
                    <div class="flex gap-6">
                      <span class="w-20">Жиры</span>
                      <span>{{ selectedProduct?.fat }} г</span>
                    </div>
                    <div class="flex gap-6">
                      <span class="w-20">Углеводы</span>
                      <span>{{ selectedProduct?.carbs }} г</span>
                    </div>
                    <div class="flex gap-6">
                      <span class="w-20">Калории</span>
                      <span
                        >{{
                          selectedProduct
                            ? calcCalories(
                                selectedProduct.protein,
                                selectedProduct.fat,
                                selectedProduct.carbs,
                              )
                            : 0
                        }}
                        ккал</span
                      >
                    </div>
                  </div>
                </div>

                <!-- Стоимость -->
                <div class="flex flex-col gap-4 w-full">
                  <p class="font-semibold text-sm">Стоимость</p>
                  <div class="flex gap-2 w-full">
                    <p class="text-sm">{{ selectedProduct?.priceRub }} ₽</p>
                    <p class="text-sm text-gray-500">
                      за {{ selectedProduct?.priceQty }} {{ selectedProduct?.priceUnit }}.
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
    <UModal v-model:open="showEditModal" :dismissible="false" :ui="{ content: 'sm:max-w-3xl' }">
      <template #content>
        <UForm
          :schema="createProductSchema"
          :state="editForm"
          class="p-6 flex flex-col gap-5"
          @submit="onFormSubmit"
        >
          <h3 class="text-xl font-semibold">
            {{ editingProduct ? 'Изменение продукта' : 'Создание продукта' }}
          </h3>

          <div class="flex gap-6">
            <!-- Загрузка изображения -->
            <div class="w-48 shrink-0">
              <AppImageUpload v-model="editForm.image" class="w-48 h-48" />
            </div>

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

              <div class="flex gap-8 flex-wrap">
                <!-- Пищевая ценность -->
                <div class="flex flex-col gap-2">
                  <p class="font-semibold text-sm">Пищевая ценность (на 100 г продукта)</p>
                  <UFormField name="user_proteins" class="flex items-center gap-3">
                    <template #label>
                      <span class="text-sm w-24">Белки (г)</span>
                    </template>
                    <UInputNumber
                      v-model="editForm.user_proteins"
                      :step="0.1"
                      :min="0"
                      :format-options="{ useGrouping: false, maximumFractionDigits: 1 }"
                      class="w-36"
                    />
                  </UFormField>
                  <UFormField name="user_fats" class="flex items-center gap-3">
                    <template #label>
                      <span class="text-sm w-24">Жиры (г)</span>
                    </template>
                    <UInputNumber
                      v-model="editForm.user_fats"
                      :step="0.1"
                      :min="0"
                      :format-options="{ useGrouping: false, maximumFractionDigits: 1 }"
                      class="w-36"
                    />
                  </UFormField>
                  <UFormField name="user_carbs" class="flex items-center gap-3">
                    <template #label>
                      <span class="text-sm w-24">Углеводы (г)</span>
                    </template>
                    <UInputNumber
                      v-model="editForm.user_carbs"
                      :step="0.1"
                      :min="0"
                      :format-options="{ useGrouping: false, maximumFractionDigits: 1 }"
                      class="w-36"
                    />
                  </UFormField>
                  <div class="flex items-center gap-3 text-sm text-gray-500">
                    <span class="w-24">Калории</span>
                    <span class="w-36 text-center">{{ editCalories }} ккал</span>
                  </div>
                </div>

                <!-- Стоимость -->
                <div class="flex flex-col gap-2">
                  <p class="font-semibold text-sm">Стоимость</p>
                  <div class="flex items-center gap-2">
                    <UFormField name="user_price">
                      <UInputNumber
                        v-model="editForm.user_price"
                        :step="0.01"
                        :min="0"
                        :format-options="{ useGrouping: false, maximumFractionDigits: 2 }"
                        class="w-32"
                      />
                    </UFormField>
                    <span class="text-sm shrink-0">Р за</span>
                    <UFormField name="quantity_price">
                      <UInputNumber
                        v-model="editForm.quantity_price"
                        :step="0.1"
                        :min="0"
                        :format-options="{ useGrouping: false, maximumFractionDigits: 1 }"
                        class="w-28"
                      />
                    </UFormField>
                    <UFormField name="measurement_unit_id">
                      <USkeleton v-if="measurementsLoading" class="h-8 w-20 rounded-md" />
                      <USelect
                        v-else
                        v-model="editForm.measurement_unit_id"
                        :items="
                          measurements.map((m) => ({
                            label: m.unit_name,
                            value: m.measurement_unit_id,
                          }))
                        "
                        class="w-24"
                      />
                    </UFormField>
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
import type { TableColumn } from '@nuxt/ui'
import type { Product } from '~/app/types'
import { createProductSchema } from '~~/schemas/product'

interface EditForm {
  image: string | null
  title: string
  user_proteins: number | null
  user_fats: number | null
  user_carbs: number | null
  user_price: number | null
  quantity_price: number | null
  measurement_unit_id: number | null
}

const toast = useToast()

const searchQuery = ref('')
const showViewModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const saving = ref(false)
const selectedProduct = ref<Product | null>(null)
const editingProduct = ref<Product | null>(null)
const productToDelete = ref<Product | null>(null)

const editForm = ref<EditForm>({
  image: null,
  title: '',
  user_proteins: 0,
  user_fats: 0,
  user_carbs: 0,
  user_price: 0,
  quantity_price: 0,
  measurement_unit_id: null,
})

const { products, fetchProducts, createProduct, updateProduct, deleteProduct } = useProducts()
const { measurements, loading: measurementsLoading, fetchMeasurements } = useMeasurements()

function calcCalories(protein: number, fat: number, carbs: number): number {
  return Math.round((4 * protein + 9 * fat + 4 * carbs) * 10) / 10
}

const editCalories = computed(() =>
  calcCalories(
    editForm.value.user_proteins ?? 0,
    editForm.value.user_fats ?? 0,
    editForm.value.user_carbs ?? 0,
  ),
)

onMounted(fetchProducts)

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
    user_proteins: 0,
    user_fats: 0,
    user_carbs: 0,
    user_price: 0,
    quantity_price: 0,
    measurement_unit_id: null,
  }
  fetchMeasurements()
  showEditModal.value = true
}

async function openEdit(product: Product) {
  editingProduct.value = product
  editForm.value = {
    image: product.image,
    title: product.name,
    user_proteins: product.protein,
    user_fats: product.fat,
    user_carbs: product.carbs,
    user_price: product.priceRub,
    quantity_price: product.priceQty,
    measurement_unit_id: null,
  }
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
      user_proteins: editForm.value.user_proteins!,
      user_fats: editForm.value.user_fats!,
      user_carbs: editForm.value.user_carbs!,
      user_price: editForm.value.user_price!,
      quantity_price: editForm.value.quantity_price!,
      measurement_unit_id: editForm.value.measurement_unit_id!,
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
