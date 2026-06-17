<template>
  <div class="flex flex-col w-full px-2 gap-4">
    <!-- Заголовок -->
    <div class="flex items-center justify-between w-full">
      <div class="flex items-center gap-2 min-w-0">
        <UButton icon="i-lucide-arrow-left" variant="ghost" color="neutral" to="/menu" />
        <h2 class="ui-header-2 truncate">{{ menuTitle }}</h2>
      </div>
      <UButton leading-icon="i-lucide-plus" label="Добавить день" @click="openAddDay" />
    </div>

    <!-- Индикатор загрузки -->
    <div v-if="loading" class="flex flex-col gap-3">
      <USkeleton v-for="i in 3" :key="i" class="h-16 w-full rounded-xl" />
    </div>

    <!-- Дни сгруппированы по месяцам -->
    <template v-else-if="groupedDays.length > 0">
      <div v-for="group in groupedDays" :key="group.label" class="flex flex-col gap-3">
        <h3 class="text-2xl font-bold">{{ group.label }}</h3>
        <MenuDayCard
          v-for="pd in group.days"
          :key="pd.planDateId"
          :plan-date-id="pd.planDateId"
          :date="pd.planDate"
          :menu-id="String(menuId)"
          @delete="onDeleteDay(pd.planDateId)"
        />
      </div>
    </template>

    <p v-else class="text-muted text-sm">
      Дней пока нет. Нажмите «Добавить день», чтобы добавить первый.
    </p>

    <!-- Диалог добавления дня -->
    <UModal v-model:open="showAddDayModal" :dismissible="false">
      <template #content>
        <div class="p-6 flex flex-col gap-5">
          <h3 class="text-xl font-semibold">Добавить день</h3>
          <UFormField label="Дата" required>
            <UInput v-model="newDayDate" type="date" class="w-full" />
          </UFormField>
          <div class="flex justify-end gap-2">
            <UButton variant="ghost" color="error" label="Отменить" @click="showAddDayModal = false" />
            <UButton label="Добавить" :disabled="!newDayDate" :loading="saving" @click="confirmAddDay" />
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script lang="ts" setup>
import type { PlanDate } from '@/types'

useHead({ title: 'Содержимое меню' })

const route = useRoute()
const toast = useToast()

const menuId = computed(() => Number(route.params.id))
const { planDates, menuTitle, loading, fetchPlanDates, createPlanDate, deletePlanDate } = usePlanDates(menuId)

onMounted(fetchPlanDates)

const groupedDays = computed(() => {
  const groups = new Map<string, PlanDate[]>()
  for (const pd of [...planDates.value].sort((a, b) => a.planDate.localeCompare(b.planDate))) {
    const key = pd.planDate.slice(0, 7)
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(pd)
  }
  return Array.from(groups.entries()).map(([key, days]) => ({
    label: monthLabel(key),
    days,
  }))
})

function monthLabel(key: string): string {
  const [year, month] = key.split('-')
  const date = new Date(Number(year), Number(month) - 1, 1)
  const name = date.toLocaleString('ru-RU', { month: 'long' })
  return `${name.charAt(0).toUpperCase()}${name.slice(1)} ${year}`
}

const showAddDayModal = ref(false)
const newDayDate = ref('')
const saving = ref(false)

function openAddDay() {
  newDayDate.value = ''
  showAddDayModal.value = true
}

async function confirmAddDay() {
  if (!newDayDate.value) return
  saving.value = true
  try {
    await createPlanDate(newDayDate.value)
    showAddDayModal.value = false
    toast.add({ title: 'День добавлен', color: 'success' })
  } catch (err: any) {
    const msg = err?.data?.statusMessage ?? 'Ошибка добавления дня'
    toast.add({ title: msg, color: err?.data?.statusCode === 409 ? 'warning' : 'error' })
  } finally {
    saving.value = false
  }
}

async function onDeleteDay(planDateId: number) {
  try {
    await deletePlanDate(planDateId)
    toast.add({ title: 'День удалён', color: 'success' })
  } catch {
    toast.add({ title: 'Ошибка удаления дня', color: 'error' })
  }
}

</script>
