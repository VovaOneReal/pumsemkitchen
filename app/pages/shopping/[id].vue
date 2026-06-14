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
          <p class="text-sm text-gray-600">Вы точно хотите удалить список {{ listTitle }}?</p>
          <div class="flex justify-end gap-2">
            <UButton
              variant="ghost"
              color="primary"
              label="Отменить"
              @click="showDeleteModal = false"
            />
            <UButton color="error" label="Удалить" @click="onDeleteList" />
          </div>
        </div>
      </template>
    </UModal>

    <!-- Список элементов -->
    <div class="flex flex-col">
      <ShoppingListItem
        v-for="item in items"
        :key="item.key"
        :id="item.id"
        :name="item.name"
        :quantity="item.quantity"
        :measurement-unit-id="item.measurementUnitId"
        :measurement-unit-abbr="item.measurementUnitAbbr"
        :checked="item.checked"
        :author-name="item.authorName"
        :measurements="measurements"
        :is-new="item.isNew"
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

// Моканые данные для визуализации
const listTitle = ref('Название списка')
const showDeleteModal = ref(false)

interface Measurement {
  measurement_unit_id: number
  unit_name: string
  unit_abbr: string
}

// Реальный запрос мер измерений
const { data: measurementsData } = await useFetch<Measurement[]>('/api/measurements')
const measurements = computed(() => measurementsData.value ?? [])

// Вспомогательная функция для получения аббревиатуры меры по id
function getUnitAbbr(id: number | null): string {
  if (!id) return ''
  return measurements.value.find((m) => m.measurement_unit_id === id)?.unit_abbr ?? ''
}

// Моканые элементы списка
let keyCounter = 100
const items = ref([
  {
    key: 1,
    id: 1,
    name: 'Название элемента',
    quantity: 15,
    measurementUnitId: null as number | null,
    measurementUnitAbbr: 'кг',
    checked: false,
    authorName: undefined as string | undefined,
    isNew: false,
  },
  {
    key: 2,
    id: 2,
    name: 'Название элемента',
    quantity: 15,
    measurementUnitId: null as number | null,
    measurementUnitAbbr: 'кг',
    checked: false,
    authorName: 'Автор',
    isNew: false,
  },
  {
    key: 3,
    id: 3,
    name: 'Название элемента',
    quantity: 15,
    measurementUnitId: null as number | null,
    measurementUnitAbbr: 'кг',
    checked: false,
    authorName: 'Автор',
    isNew: false,
  },
  {
    key: 4,
    id: 4,
    name: 'Название элемента',
    quantity: 15,
    measurementUnitId: null as number | null,
    measurementUnitAbbr: 'кг',
    checked: false,
    authorName: undefined,
    isNew: false,
  },
])

function addNewItem() {
  keyCounter++
  items.value.unshift({
    key: keyCounter,
    id: undefined as any,
    name: '',
    quantity: 0,
    measurementUnitId: null,
    measurementUnitAbbr: '',
    checked: false,
    authorName: undefined,
    isNew: true,
  })
}

function onSave(
  key: number,
  data: { name: string; quantity: number; measurementUnitId: number | null },
) {
  const item = items.value.find((i) => i.key === key)
  if (!item) return
  item.name = data.name
  item.quantity = data.quantity
  item.measurementUnitId = data.measurementUnitId
  item.measurementUnitAbbr = getUnitAbbr(data.measurementUnitId)
  item.isNew = false
}

function onCancelNew(key: number) {
  items.value = items.value.filter((i) => i.key !== key)
}

function onDeleteItem(key: number) {
  items.value = items.value.filter((i) => i.key !== key)
}

function onCheck(key: number, value: boolean) {
  const item = items.value.find((i) => i.key === key)
  if (item) item.checked = value
}

function onDeleteList() {
  showDeleteModal.value = false
  // TODO: реализовать удаление списка через API
  navigateTo('/shopping')
}
</script>
