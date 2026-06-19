<template>
  <div class="flex flex-col w-full h-full px-2 gap-4">
    <!-- Заголовок -->
    <div class="flex items-center gap-4 flex-wrap flex-shrink-0">
      <h2 class="ui-header-2">Статистика цен из ЕМИСС</h2>
      <UButton
        leading-icon="i-lucide-upload"
        label="Загрузить данные (SDMX)"
        :loading="uploading"
        @click="fileInput?.click()"
      />
      <NuxtLink
        to="/help/emiss#загрузка-данных"
        class="text-sm text-muted hover:text-primary transition-colors"
      >Следуйте инструкции по загрузке данных</NuxtLink>
      <!-- Скрытый input для выбора XML-файла -->
      <input
        ref="fileInput"
        type="file"
        accept=".xml"
        class="hidden"
        @change="onFileChange"
      />
    </div>

    <!-- Поиск -->
    <UInput
      v-model="searchQuery"
      placeholder="Название товара..."
      class="w-64 flex-shrink-0"
      :trailing-icon="'i-lucide-search'"
    />

    <!-- Таблица (прокручивается в своём блоке) -->
    <div class="flex-1 overflow-auto min-h-0">
      <div v-if="loading" class="flex flex-col gap-2">
        <USkeleton v-for="i in 5" :key="i" class="h-10 w-full rounded-md" />
      </div>
      <UTable
        v-else
        :data="filteredGoods"
        :columns="columns"
        :empty="'Информации о товарах нет'"
      >
        <template #name-cell="{ row }">
          <UTooltip :text="row.original.name" :delay-duration="300">
            <span class="block truncate max-w-64">{{ row.original.name }}</span>
          </UTooltip>
        </template>

        <template #isShowingGoods-cell="{ row }">
          <UCheckbox
            :model-value="row.original.isShowingGoods"
            @update:model-value="onToggle(row.original.id, $event)"
          />
        </template>
      </UTable>
    </div>

    <!-- Нижняя панель с кнопкой сохранения -->
    <div class="flex justify-end py-3 border-t flex-shrink-0">
      <UButton
        label="Сохранить изменения"
        :disabled="!isDirty"
        :loading="saving"
        @click="save"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { TableColumn } from '@nuxt/ui'
import type { EmissGoodsItem } from '~/types'

useHead({ title: 'ЕМИСС' })

const toast = useToast()
const { goods, fetchGoods, saveShowingFlags } = useEmissGoods()

const loading = ref(false)
const saving = ref(false)
const searchQuery = ref('')

const filteredGoods = computed(() =>
  localGoods.value.filter((g) =>
    g.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
  ),
)
const uploading = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

// Локальная копия для редактирования
const localGoods = ref<EmissGoodsItem[]>([])
// Эталонные значения флагов для отслеживания изменений
const originalFlags = ref<Map<number, boolean>>(new Map())

const isDirty = computed(() =>
  localGoods.value.some((g) => g.isShowingGoods !== originalFlags.value.get(g.id)),
)

onMounted(async () => {
  loading.value = true
  try {
    await fetchGoods()
    initLocal()
  } finally {
    loading.value = false
  }
})

function initLocal() {
  localGoods.value = goods.value.map((g) => ({ ...g }))
  originalFlags.value = new Map(goods.value.map((g) => [g.id, g.isShowingGoods]))
}

function onToggle(id: number, value: boolean) {
  const item = localGoods.value.find((g) => g.id === id)
  if (item) item.isShowingGoods = value
}

async function save() {
  const changes = localGoods.value
    .filter((g) => g.isShowingGoods !== originalFlags.value.get(g.id))
    .map((g) => ({ id: g.id, is_showing_goods: g.isShowingGoods }))

  if (!changes.length) return

  saving.value = true
  try {
    await saveShowingFlags(changes)
    // Обновляем эталон после успешного сохранения
    for (const c of changes) {
      originalFlags.value.set(c.id, c.is_showing_goods)
    }
    toast.add({ title: 'Изменения сохранены', color: 'success' })
  } catch {
    toast.add({ title: 'Ошибка при сохранении', color: 'error' })
  } finally {
    saving.value = false
  }
}

async function onFileChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  // Сбрасываем input, чтобы можно было загрузить тот же файл повторно
  if (fileInput.value) fileInput.value.value = ''

  const formData = new FormData()
  formData.append('file', file)

  uploading.value = true
  try {
    const result = await $fetch<{ addedGoods: number; addedRecords: number }>(
      '/api/emiss/upload',
      { method: 'POST', body: formData },
    )
    const parts = []
    if (result.addedGoods > 0) parts.push(`новых товаров: ${result.addedGoods}`)
    if (result.addedRecords > 0) parts.push(`новых записей: ${result.addedRecords}`)
    const detail = parts.length ? parts.join(', ') : 'нет новых данных'
    toast.add({ title: `Загрузка завершена (${detail})`, color: 'success' })
    // Обновляем таблицу
    await fetchGoods()
    initLocal()
  } catch (e: any) {
    const msg = e?.data?.statusMessage ?? 'Ошибка при загрузке файла'
    toast.add({ title: msg, color: 'error' })
  } finally {
    uploading.value = false
  }
}

const columns: TableColumn<EmissGoodsItem>[] = [
  { id: 'name', accessorKey: 'name', header: 'Название товара' },
  {
    accessorKey: 'latestPrice',
    header: 'Актуальная цена',
    cell: ({ row }) =>
      row.original.latestPrice !== null ? `${row.original.latestPrice} ₽` : '—',
  },
  {
    accessorKey: 'latestDate',
    header: 'Дата актуальной цены',
    cell: ({ row }) => row.original.latestDate ?? '—',
  },
  { id: 'isShowingGoods', header: 'Показывать в списке?' },
]
</script>
