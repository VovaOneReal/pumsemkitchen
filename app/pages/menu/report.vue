<template>
  <div class="flex flex-col w-full px-2 gap-4">
    <!-- Заголовок -->
    <div class="flex items-center justify-between w-full">
      <div class="flex items-center gap-2 min-w-0">
        <UButton icon="i-lucide-arrow-left" variant="ghost" color="neutral" to="/menu" />
        <h2 class="ui-header-2">Отчёт по питанию</h2>
      </div>
      <UButton
        leading-icon="i-lucide-download"
        label="Скачать отчёт"
        variant="outline"
        color="neutral"
        :loading="downloading"
        :disabled="rows.length === 0"
        @click="downloadReport"
      />
    </div>

    <!-- Диапазон дат -->
    <div class="flex items-center gap-3 flex-wrap">
      <div class="flex items-center gap-2">
        <span class="text-sm text-muted">От:</span>
        <UInput v-model="dateFrom" type="date" class="w-44" @change="fetchReport" />
      </div>
      <div class="flex items-center gap-2">
        <span class="text-sm text-muted">До:</span>
        <UInput v-model="dateTo" type="date" class="w-44" @change="fetchReport" />
      </div>
    </div>

    <!-- Collapsible: График -->
    <div class="rounded-xl border border-default overflow-hidden">
      <button
        class="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-elevated transition-colors"
        @click="chartOpen = !chartOpen"
      >
        <span>{{ chartOpen ? 'Скрыть график' : 'Показать график' }}</span>
        <UIcon
          :name="chartOpen ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
          class="text-muted w-4 h-4"
        />
      </button>
      <div v-if="chartOpen" class="px-4 pb-4 border-t border-default">
        <USkeleton v-if="loading" class="h-80 w-full rounded-xl mt-4" />
        <NutritionBarChart v-else-if="rows.length > 0" class="mt-4" :rows="rows" />
        <p v-else class="text-muted text-sm py-4">Нет данных за выбранный период</p>
      </div>
    </div>

    <!-- Таблица -->
    <USkeleton v-if="loading" class="h-48 w-full rounded-xl" />
    <UTable v-else :data="rows" :columns="columns" empty="Нет данных за выбранный период" />
  </div>
</template>

<script lang="ts" setup>
import * as XLSX from 'xlsx'

useHead({ title: 'Отчёт по питанию' })

type DayReport = {
  date: string
  proteins: number
  fats: number
  carbs: number
  calories: number
  cost: number
}

const today = new Date().toISOString().slice(0, 10)
const firstOfMonth = today.slice(0, 8) + '01'

const dateFrom = ref(firstOfMonth)
const dateTo = ref(today)
const rows = ref<DayReport[]>([])
const loading = ref(false)
const downloading = ref(false)
const chartOpen = ref(false)

const fmt1 = (v: number) => (Math.round(v * 10) / 10).toLocaleString('ru-RU')
const fmt2 = (v: number) =>
  (Math.round(v * 100) / 100).toLocaleString('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${d}.${m}.${y}`
}

const columns = [
  {
    accessorKey: 'date',
    header: 'День',
    cell: ({ row }: { row: { original: DayReport } }) => formatDate(row.original.date),
  },
  {
    accessorKey: 'proteins',
    header: 'Белки, г',
    cell: ({ row }: { row: { original: DayReport } }) => fmt1(row.original.proteins),
  },
  {
    accessorKey: 'fats',
    header: 'Жиры, г',
    cell: ({ row }: { row: { original: DayReport } }) => fmt1(row.original.fats),
  },
  {
    accessorKey: 'carbs',
    header: 'Углеводы, г',
    cell: ({ row }: { row: { original: DayReport } }) => fmt1(row.original.carbs),
  },
  {
    accessorKey: 'calories',
    header: 'Калории, ккал',
    cell: ({ row }: { row: { original: DayReport } }) => fmt1(row.original.calories),
  },
  {
    accessorKey: 'cost',
    header: 'Стоимость, ₽',
    cell: ({ row }: { row: { original: DayReport } }) => fmt2(row.original.cost),
  },
]

async function fetchReport() {
  if (!dateFrom.value || !dateTo.value || dateFrom.value > dateTo.value) return
  loading.value = true
  const workspaceStore = useWorkspaceStore()
  try {
    const query: Record<string, unknown> = { from: dateFrom.value, to: dateTo.value }
    if (workspaceStore.activeFamilyId) query.familyId = workspaceStore.activeFamilyId
    rows.value = await $fetch<DayReport[]>('/api/report/nutrition', { query })
  } catch {
    rows.value = []
  } finally {
    loading.value = false
  }
}

async function downloadReport() {
  downloading.value = true
  try {
    const aoa: (string | number)[][] = [
      ['Сервис планирования питания: отчёт по питанию'],
      [`Период: ${formatDate(dateFrom.value)} — ${formatDate(dateTo.value)}`],
      [`Дата формирования: ${formatDate(today)}`],
      [],
      ['День', 'Белки (г)', 'Жиры (г)', 'Углеводы (г)', 'Калории (ккал)', 'Стоимость (₽)'],
      ...rows.value.map((r) => [
        formatDate(r.date),
        r.proteins,
        r.fats,
        r.carbs,
        r.calories,
        r.cost,
      ]),
    ]
    const ws = XLSX.utils.aoa_to_sheet(aoa)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Отчёт')
    XLSX.writeFile(wb, `nutrition_report_${dateFrom.value}_${dateTo.value}.xlsx`)
  } finally {
    downloading.value = false
  }
}

onMounted(fetchReport)
</script>
