<template>
  <div class="flex flex-col w-full px-2 gap-4">
    <!-- Заголовок со стрелкой назад и кнопкой удаления -->
    <div class="flex items-center justify-between w-full">
      <div class="flex items-center gap-2">
        <UButton icon="i-lucide-arrow-left" variant="ghost" color="primary" to="/shopping" />
        <h2 class="ui-header-2">{{ listTitle }}</h2>
      </div>
      <UButton
        icon="i-lucide-trash-2"
        color="error"
        variant="subtle"
        @click="showDeleteModal = true"
      />
    </div>

    <!-- Кнопка добавления нового элемента -->
    <div>
      <UButton leading-icon="i-lucide-plus" label="Добавить" variant="subtle" @click="addNewItem" />
    </div>

    <!-- Диалог подтверждения удаления списка -->
    <UModal v-model:open="showDeleteModal">
      <template #content>
        <div class="p-6 flex flex-col gap-4">
          <h3 class="text-lg font-semibold">Подтвердите удаление</h3>
          <p class="text-sm text-gray-600">Вы точно хотите удалить список «{{ listTitle }}»?</p>
          <div class="flex justify-end gap-2">
            <UButton
              variant="ghost"
              color="primary"
              label="Отменить"
              @click="showDeleteModal = false"
            />
            <UButton
              color="error"
              label="Удалить"
              :loading="deletingList"
              @click="onDeleteList"
            />
          </div>
        </div>
      </template>
    </UModal>

    <!-- Состояние загрузки элементов -->
    <p v-if="elementsLoading" class="text-sm text-muted">Ищем элементы списка, подождите...</p>

    <!-- Пустой список -->
    <p v-else-if="savedItems.length === 0 && newItems.length === 0" class="text-sm text-muted">
      Список пуст. Нажмите «Добавить», чтобы добавить первый элемент.
    </p>

    <!-- Список элементов -->
    <div v-else class="flex flex-col">
      <ShoppingListItem
        v-for="item in displayItems"
        :key="item.key"
        :id="item.id"
        :name="item.name"
        :quantity="item.quantity"
        :measurement-unit-id="item.measurementUnitId ?? undefined"
        :measurement-unit-abbr="item.measurementUnitAbbr ?? undefined"
        :checked="item.checked"
        :author-name="item.authorName ?? undefined"
        :measurements="measurements"
        :is-new="item.isNew"
        :saving="item.isNew ? addingElement : updatingId === item.id"
        :deleting="item.id != null ? deletingElementId === item.id : false"
        :checking="item.id != null ? checkingId === item.id : false"
        @save="onSave(item.key, $event)"
        @cancel="onCancelNew(item.key)"
        @delete="onDeleteItem(item.key)"
        @check="onCheck(item.key, $event)"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
useHead({ title: 'Список покупок' })

const route = useRoute()
const toast = useToast()
const listId = Number(route.params.id)

const { fetchList, deleteList, deletingId: listDeletingId } = useShoppingLists()
const { measurements, fetchMeasurements } = useMeasurements()
const {
  loading: elementsLoading,
  addingElement,
  updatingId,
  deletingId: deletingElementId,
  checkingId,
  fetchElements,
  createElement,
  updateElement,
  checkElement,
  deleteElement,
} = useListElements()

const listTitle = ref('')
const showDeleteModal = ref(false)
const deletingList = computed(() => listDeletingId.value === listId)

// Новые элементы ещё не сохранённые
type Item = {
  key: number
  id?: number
  name: string
  quantity: number
  measurementUnitId: number | null
  measurementUnitAbbr: string | null
  checked: boolean
  authorName: string | null
  isNew: boolean
}

let keyCounter = 0
const newItems = ref<Item[]>([])
const savedItems = ref<Item[]>([])

// Отображаем новые элементы поверх сохранённых
const displayItems = computed(() => [...newItems.value, ...savedItems.value])

// Первый доступный unit из разрешённых типов
const ALLOWED_TYPES = ['weight', 'volume', 'piece']
const defaultUnitId = computed(
  () => measurements.value.find((m) => ALLOWED_TYPES.includes(m.measure_type))?.measurement_unit_id ?? null,
)

async function loadList() {
  try {
    const list = await fetchList(listId)
    listTitle.value = list.title
  } catch {
    toast.add({ title: 'Не удалось загрузить список покупок', color: 'error' })
  }
}

async function loadElements() {
  try {
    const elements = await fetchElements(listId)
    savedItems.value = elements.map((el) => ({
      key: ++keyCounter,
      id: el.id,
      name: el.title,
      quantity: el.quantity,
      measurementUnitId: el.measurementUnitId,
      measurementUnitAbbr: el.measurementUnitAbbr,
      checked: el.isChecked,
      authorName: el.authorName,
      isNew: false,
    }))
  } catch {
    toast.add({ title: 'Не удалось загрузить элементы списка', color: 'error' })
  }
}

onMounted(() => {
  Promise.all([fetchMeasurements(), loadList(), loadElements()])
})

function addNewItem() {
  newItems.value.unshift({
    key: ++keyCounter,
    id: undefined,
    name: '',
    quantity: 1,
    measurementUnitId: defaultUnitId.value,
    measurementUnitAbbr: null,
    checked: false,
    authorName: null,
    isNew: true,
  })
}

async function onSave(
  key: number,
  data: { name: string; quantity: number; measurementUnitId: number | null },
) {
  const newItem = newItems.value.find((i) => i.key === key)
  const savedItem = savedItems.value.find((i) => i.key === key)
  const item = newItem ?? savedItem

  if (!item) return

  try {
    if (item.id == null) {
      // Создание нового элемента
      if (!data.measurementUnitId) {
        toast.add({ title: 'Выберите единицу измерения', color: 'warning' })
        return
      }
      const created = await createElement(listId, {
        title: data.name,
        quantity: data.quantity,
        measurementUnitId: data.measurementUnitId,
        isChecked: false,
      })
      // Добавляем реальный элемент с новым ключом — Vue создаст свежий компонент сразу в режиме просмотра
      savedItems.value.unshift({
        key: ++keyCounter,
        id: created.id,
        name: created.title,
        quantity: created.quantity,
        measurementUnitId: created.measurementUnitId,
        measurementUnitAbbr: created.measurementUnitAbbr,
        checked: created.isChecked,
        authorName: created.authorName,
        isNew: false,
      })
      newItems.value = newItems.value.filter((i) => i.key !== key)
      toast.add({ title: 'Элемент добавлен', color: 'success' })
    } else {
      // Обновление существующего
      const updated = await updateElement(listId, item.id, {
        title: data.name,
        quantity: data.quantity,
        ...(data.measurementUnitId != null && { measurementUnitId: data.measurementUnitId }),
      })
      const idx = savedItems.value.findIndex((i) => i.key === key)
      if (idx !== -1) {
        savedItems.value[idx] = {
          ...savedItems.value[idx],
          name: updated.title,
          quantity: updated.quantity,
          measurementUnitId: updated.measurementUnitId,
          measurementUnitAbbr: updated.measurementUnitAbbr,
          isNew: false,
        }
      }
      toast.add({ title: 'Элемент сохранён', color: 'success' })
    }
  } catch {
    toast.add({ title: 'Не удалось сохранить элемент', color: 'error' })
  }
}

function onCancelNew(key: number) {
  newItems.value = newItems.value.filter((i) => i.key !== key)
}

async function onDeleteItem(key: number) {
  const item = savedItems.value.find((i) => i.key === key)
  if (!item?.id) return

  try {
    await deleteElement(listId, item.id)
    savedItems.value = savedItems.value.filter((i) => i.key !== key)
    toast.add({ title: 'Элемент удалён', color: 'success' })
  } catch {
    toast.add({ title: 'Не удалось удалить элемент', color: 'error' })
  }
}

async function onCheck(key: number, value: boolean) {
  const item = savedItems.value.find((i) => i.key === key)
  if (!item?.id) return

  try {
    const updated = await checkElement(listId, item.id, value)
    item.checked = updated.isChecked
  } catch {
    // Откатить состояние чекбокса
    item.checked = !value
    toast.add({ title: 'Не удалось обновить элемент', color: 'error' })
  }
}

async function onDeleteList() {
  try {
    await deleteList(listId)
    toast.add({ title: 'Список покупок удалён', color: 'success' })
    navigateTo('/shopping')
  } catch {
    showDeleteModal.value = false
    toast.add({ title: 'Не удалось удалить список покупок', color: 'error' })
  }
}
</script>
