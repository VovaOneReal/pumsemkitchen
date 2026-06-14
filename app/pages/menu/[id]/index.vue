<template>
  <div class="flex flex-col w-full px-2 gap-4">
    <!-- Заголовок -->
    <div class="flex items-center justify-between w-full">
      <div class="flex items-center gap-2 min-w-0">
        <UButton icon="i-lucide-arrow-left" variant="ghost" color="neutral" to="/menu" />
        <h2 class="ui-header-2 truncate">{{ menu.title }}</h2>
      </div>
      <UButton leading-icon="i-lucide-plus" label="Добавить день" @click="openAddDay" />
    </div>

    <!-- Дни сгруппированы по месяцам -->
    <template v-if="groupedDays.length > 0">
      <div v-for="group in groupedDays" :key="group.label" class="flex flex-col gap-3">
        <h3 class="text-2xl font-bold">{{ group.label }}</h3>
        <MenuDayCard
          v-for="day in group.days"
          :key="day"
          :date="day"
          :menu-id="menuId"
          @delete="deleteDay(day)"
          @update-date="(newDate) => updateDay(day, newDate)"
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
            <UButton label="Добавить" :disabled="!newDayDate" @click="confirmAddDay" />
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script lang="ts" setup>
useHead({ title: 'Содержимое меню' })

const route = useRoute()
const toast = useToast()

const menuId = computed(() => String(route.params.id))

const menu = ref({ title: 'Название меню' })

const days = ref<string[]>([
  '2026-03-24',
  '2026-03-25',
  '2026-03-27',
  '2026-04-01',
  '2026-04-03',
])

const groupedDays = computed(() => {
  const groups = new Map<string, string[]>()
  for (const day of [...days.value].sort()) {
    const key = day.slice(0, 7)
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(day)
  }
  return Array.from(groups.entries()).map(([key, dayList]) => ({
    label: monthLabel(key),
    days: dayList,
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

function openAddDay() {
  newDayDate.value = ''
  showAddDayModal.value = true
}

function confirmAddDay() {
  if (!newDayDate.value) return
  if (days.value.includes(newDayDate.value)) {
    toast.add({ title: 'Этот день уже добавлен', color: 'warning' })
    return
  }
  days.value.push(newDayDate.value)
  showAddDayModal.value = false
  toast.add({ title: 'День добавлен', color: 'success' })
}

function deleteDay(date: string) {
  days.value = days.value.filter((d) => d !== date)
  toast.add({ title: 'День удалён', color: 'success' })
}

function updateDay(oldDate: string, newDate: string) {
  if (days.value.includes(newDate) && newDate !== oldDate) {
    toast.add({ title: 'Этот день уже добавлен', color: 'warning' })
    return
  }
  const idx = days.value.indexOf(oldDate)
  if (idx !== -1) days.value[idx] = newDate
  toast.add({ title: 'Дата изменена', color: 'success' })
}
</script>
