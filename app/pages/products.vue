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

    <UTable :data="filteredProducts" :columns="columns">
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
    <UModal v-model:open="showViewModal">
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
                  icon="i-lucide-trash-2"
                  color="error"
                  variant="soft"
                  class="flex-1"
                  @click="openDeleteFromView"
                />
                <UButton
                  icon="i-lucide-pencil"
                  color="primary"
                  variant="soft"
                  class="flex-1"
                  @click="openEditFromView"
                />
              </div>
            </div>

            <!-- Информация о продукте -->
            <div class="flex flex-col gap-4 flex-1">
              <p class="text-lg font-bold">{{ selectedProduct?.name }}</p>

              <div class="flex gap-8">
                <!-- Пищевая ценность -->
                <div class="flex flex-col gap-2">
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
                  </div>
                </div>

                <!-- Стоимость -->
                <div class="flex flex-col gap-2">
                  <p class="font-semibold text-sm">Стоимость</p>
                  <p class="text-sm">
                    {{ selectedProduct?.priceRub }} ₽
                  </p>
                  <p class="text-sm text-gray-500">
                    за {{ selectedProduct?.priceQty }} {{ selectedProduct?.priceUnit }}.
                  </p>
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
        <div class="p-6 flex flex-col gap-5">
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
              <UFormField label="Название продукта" required>
                <UInput
                  v-model="editForm.name"
                  placeholder="Название продукта"
                  :maxlength="32"
                  class="w-full"
                />
              </UFormField>

              <div class="flex gap-8 flex-wrap">
                <!-- Пищевая ценность -->
                <div class="flex flex-col gap-2">
                  <p class="font-semibold text-sm">Пищевая ценность (на 100 г продукта)</p>
                  <div class="flex items-center gap-3">
                    <span class="text-sm w-24">Белки (г)</span>
                    <UInputNumber
                      v-model="editForm.protein"
                      :step="0.1"
                      :min="0"
                      :format-options="{ useGrouping: false, maximumFractionDigits: 1 }"
                      class="w-36"
                    />
                  </div>
                  <div class="flex items-center gap-3">
                    <span class="text-sm w-24">Жиры (г)</span>
                    <UInputNumber
                      v-model="editForm.fat"
                      :step="0.1"
                      :min="0"
                      :format-options="{ useGrouping: false, maximumFractionDigits: 1 }"
                      class="w-36"
                    />
                  </div>
                  <div class="flex items-center gap-3">
                    <span class="text-sm w-24">Углеводы (г)</span>
                    <UInputNumber
                      v-model="editForm.carbs"
                      :step="0.1"
                      :min="0"
                      :format-options="{ useGrouping: false, maximumFractionDigits: 1 }"
                      class="w-36"
                    />
                  </div>
                </div>

                <!-- Стоимость -->
                <div class="flex flex-col gap-2">
                  <p class="font-semibold text-sm">Стоимость</p>
                  <div class="flex items-center gap-2">
                    <UInputNumber
                      v-model="editForm.priceRub"
                      :step="0.01"
                      :min="0"
                      :format-options="{ useGrouping: false, maximumFractionDigits: 2 }"
                      class="w-32"
                    />
                    <span class="text-sm shrink-0">Р за</span>
                    <UInputNumber
                      v-model="editForm.priceQty"
                      :step="0.1"
                      :min="0"
                      :format-options="{ useGrouping: false, maximumFractionDigits: 1 }"
                      class="w-28"
                    />
                    <USelect
                      v-model="editForm.priceUnit"
                      :items="unitOptions"
                      class="w-20"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-2">
            <UButton variant="ghost" color="error" label="Отменить" @click="cancelEdit" />
            <UButton label="Сохранить" @click="saveEdit" />
          </div>
        </div>
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
            <UButton variant="ghost" color="primary" label="Отменить" @click="showDeleteModal = false" />
            <UButton color="error" label="Удалить" @click="deleteProduct" />
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script lang="ts" setup>
import type { TableColumn } from '@nuxt/ui'

interface Product {
  id: number
  image: string | null
  name: string
  priceRub: number
  priceQty: number
  priceUnit: string
  protein: number
  fat: number
  carbs: number
  calories: number
}

interface EditForm {
  image: string | null
  name: string
  protein: number
  fat: number
  carbs: number
  priceRub: number
  priceQty: number
  priceUnit: string
}

const searchQuery = ref('')
const showViewModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const selectedProduct = ref<Product | null>(null)
const editingProduct = ref<Product | null>(null)
const productToDelete = ref<Product | null>(null)

const editForm = ref<EditForm>({
  image: null,
  name: '',
  protein: 0,
  fat: 0,
  carbs: 0,
  priceRub: 0,
  priceQty: 0,
  priceUnit: 'кг',
})

const unitOptions = ['кг', 'г', 'шт', 'мл', 'л']

const products: Product[] = reactive([
  {
    id: 1,
    image: null,
    name: 'Название продукта',
    priceRub: 150,
    priceQty: 800,
    priceUnit: 'г',
    protein: 10.4,
    fat: 4.5,
    carbs: 14.1,
    calories: 225.6,
  },
])

const columns: TableColumn<Product>[] = [
  { id: 'image', header: '' },
  { accessorKey: 'name', header: 'Название' },
  {
    accessorKey: 'priceRub',
    header: 'Р / кг',
    cell: ({ row }) => `${row.original.priceRub} ₽`,
  },
  { accessorKey: 'protein', header: 'Белки' },
  { accessorKey: 'fat', header: 'Жиры' },
  { accessorKey: 'carbs', header: 'Углеводы' },
  { accessorKey: 'calories', header: 'Калории' },
  { id: 'actions', header: 'Действия' },
]

const filteredProducts = computed(() =>
  products.filter((p) => p.name.toLowerCase().includes(searchQuery.value.toLowerCase())),
)

function openView(product: Product) {
  selectedProduct.value = product
  showViewModal.value = true
}

function openCreate() {
  editingProduct.value = null
  editForm.value = { image: null, name: '', protein: 0, fat: 0, carbs: 0, priceRub: 0, priceQty: 0, priceUnit: 'кг' }
  showEditModal.value = true
}

function openEdit(product: Product) {
  editingProduct.value = product
  editForm.value = {
    image: product.image,
    name: product.name,
    protein: product.protein,
    fat: product.fat,
    carbs: product.carbs,
    priceRub: product.priceRub,
    priceQty: product.priceQty,
    priceUnit: product.priceUnit,
  }
  showEditModal.value = true
}

function openEditFromView() {
  if (!selectedProduct.value) return
  showViewModal.value = false
  openEdit(selectedProduct.value)
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

function deleteProduct() {
  // TODO: вызов API удаления
  showDeleteModal.value = false
  productToDelete.value = null
}

function cancelEdit() {
  showEditModal.value = false
  editingProduct.value = null
}

function saveEdit() {
  // TODO: вызов API сохранения
  showEditModal.value = false
  editingProduct.value = null
}
</script>
