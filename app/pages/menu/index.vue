<template>
  <div class="flex flex-col w-full px-2 gap-4">
    <!-- Заголовок -->
    <div class="flex items-center justify-between w-full">
      <h2 class="ui-header-2">Меню</h2>
      <div class="flex items-center gap-2">
        <UButton leading-icon="i-lucide-bar-chart-2" label="Отчёт по питанию" variant="outline" color="neutral" to="/menu/report" />
        <UButton leading-icon="i-lucide-sparkles" label="Сгенерировать" variant="outline" color="neutral" @click="openGenerate" />
        <UButton leading-icon="i-lucide-plus" label="Создать" @click="openCreate" />
      </div>
    </div>

    <!-- Поиск, сортировка, фильтр -->
    <div class="flex items-center gap-3 flex-wrap">
      <UInput
        v-model="searchQuery"
        placeholder="Название..."
        class="w-64"
        trailing-icon="i-lucide-search"
      />
      <UDropdownMenu :items="sortItems">
        <UButton leading-icon="i-lucide-arrow-up-down" label="Сортировка" variant="outline" color="neutral" />
      </UDropdownMenu>
      <UDropdownMenu :items="filterItems">
        <UButton leading-icon="i-lucide-filter" label="Фильтр" variant="outline" color="neutral" />
      </UDropdownMenu>
    </div>

    <!-- Индикатор загрузки -->
    <div v-if="loading" class="flex flex-col gap-3">
      <USkeleton v-for="i in 3" :key="i" class="h-24 w-full rounded-lg" />
    </div>

    <!-- Меню сгруппированы по месяцу даты начала -->
    <template v-else-if="groupedMenus.length > 0">
      <div v-for="group in groupedMenus" :key="group.label" class="flex flex-col gap-3">
        <h3 class="text-2xl font-bold">{{ group.label }}</h3>
        <MenuCard
          v-for="menu in group.items"
          :key="menu.id"
          :id="menu.id"
          :title="menu.title"
          :author-name="menu.authorName"
          :created-at="menu.createdAt"
          :edited-at="menu.editedAt"
          :editor-name="menu.editorName"
          :date-from="menu.dateFrom"
          :date-to="menu.dateTo"
          :shopping-list-loading="shoppingListLoadingIds.has(menu.id)"
          @delete="onDeleteMenu(menu.id)"
          @edit="openEdit(menu)"
          @create-shopping-list="onCreateShoppingList(menu.id)"
        />
      </div>
    </template>

    <p v-else class="text-muted text-sm">
      Меню пока нет. Нажмите «Создать», чтобы добавить первое.
    </p>

    <!-- Диалог генерации меню -->
    <UModal v-model:open="showGenerateModal" :dismissible="false">
      <template #content>
        <UForm
          :schema="menuGenerateSchema"
          :state="generateState"
          class="p-6 flex flex-col gap-5"
          @submit="onGenerateSubmit"
        >
          <h3 class="text-xl font-semibold">Генерация меню</h3>

          <UFormField name="title" label="Название меню" required>
            <UInput
              v-model="generateState.title"
              placeholder="Название меню"
              :maxlength="128"
              class="w-full"
              @input="onTitleInput"
            />
          </UFormField>

          <div class="grid grid-cols-2 gap-3">
            <UFormField name="dateFrom" label="Начало периода" required>
              <UInput v-model="generateState.dateFrom" type="date" class="w-full" />
            </UFormField>
            <UFormField name="dateTo" label="Окончание периода" required>
              <UInput v-model="generateState.dateTo" type="date" class="w-full" />
            </UFormField>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <UFormField name="numberOfPeople" label="Количество человек" required>
              <UInput v-model="generateState.numberOfPeople" type="number" min="1" class="w-full" />
            </UFormField>
            <UFormField name="targetCaloriesPerDay" label="Ккал в день" required>
              <UInput v-model="generateState.targetCaloriesPerDay" type="number" min="100" class="w-full" />
            </UFormField>
          </div>

          <UFormField name="totalBudget" label="Лимит бюджета, ₽">
            <UInput
              v-model="generateState.totalBudget"
              type="number"
              min="1"
              placeholder="Необязательно"
              class="w-full"
            />
          </UFormField>

          <UFormField name="selectedMeals" label="Приёмы пищи" required>
            <div class="grid grid-cols-2 gap-2 mt-1">
              <UCheckbox
                v-for="meal in ALL_MEALS"
                :key="meal"
                :label="meal"
                :model-value="isMealSelected(meal)"
                @update:model-value="toggleMeal(meal)"
              />
            </div>
          </UFormField>

          <div class="flex justify-end gap-2">
            <UButton type="button" variant="ghost" color="error" label="Отменить" @click="closeGenerate" />
            <UButton type="submit" :loading="generating" label="Сгенерировать" />
          </div>
        </UForm>
      </template>
    </UModal>

    <!-- Диалог создания / редактирования -->
    <UModal v-model:open="showFormModal" :dismissible="false">
      <template #content>
        <UForm
          :schema="menuFormSchema"
          :state="formState"
          class="p-6 flex flex-col gap-5"
          @submit="onFormSubmit"
        >
          <h3 class="text-xl font-semibold">
            {{ editingMenu ? 'Редактирование меню' : 'Создание меню' }}
          </h3>

          <UFormField name="title" label="Название меню" required>
            <UInput
              v-model="formState.title"
              placeholder="Название меню"
              :maxlength="128"
              class="w-full"
            />
          </UFormField>

          <div class="flex justify-end gap-2">
            <UButton
              type="button"
              variant="ghost"
              color="error"
              label="Отменить"
              @click="closeForm"
            />
            <UButton type="submit" :loading="saving" label="Сохранить" />
          </div>
        </UForm>
      </template>
    </UModal>
  </div>
</template>

<script lang="ts" setup>
import type { Menu } from '@/types'
import { menuFormSchema } from '~~/schemas/menu'
import { menuGenerateSchema } from '~~/schemas/menuGenerate'

useHead({ title: 'Меню' })

const toast = useToast()
const { menus, loading, fetchMenus, createMenu, updateMenu, deleteMenu, createMenuShoppingList, generateMenu } = useMenus()

onMounted(fetchMenus)

const searchQuery = ref('')
const sortKey = ref<'dateFrom-desc' | 'dateFrom-asc' | 'createdAt-desc' | 'title-asc' | 'title-desc'>('dateFrom-desc')
const filterMonth = ref<string | null>(null)

const shoppingListLoadingIds = reactive(new Set<number>())

const showFormModal = ref(false)
const saving = ref(false)
const editingMenu = ref<Menu | null>(null)
const formState = ref({ title: '' })

const sortItems = computed(() => [
  {
    label: 'По дате начала: новые сначала',
    type: 'checkbox' as const,
    checked: sortKey.value === 'dateFrom-desc',
    onSelect: () => { sortKey.value = 'dateFrom-desc' },
  },
  {
    label: 'По дате начала: старые сначала',
    type: 'checkbox' as const,
    checked: sortKey.value === 'dateFrom-asc',
    onSelect: () => { sortKey.value = 'dateFrom-asc' },
  },
  {
    label: 'По дате создания: новые сначала',
    type: 'checkbox' as const,
    checked: sortKey.value === 'createdAt-desc',
    onSelect: () => { sortKey.value = 'createdAt-desc' },
  },
  {
    label: 'По названию: А-Я',
    type: 'checkbox' as const,
    checked: sortKey.value === 'title-asc',
    onSelect: () => { sortKey.value = 'title-asc' },
  },
  {
    label: 'По названию: Я-А',
    type: 'checkbox' as const,
    checked: sortKey.value === 'title-desc',
    onSelect: () => { sortKey.value = 'title-desc' },
  },
])

const availableMonths = computed(() => {
  const seen = new Set<string>()
  return menus.value
    .filter((m) => m.dateFrom)
    .map((m) => {
      const key = m.dateFrom!.slice(0, 7)
      return { key, label: monthLabel(key) }
    })
    .filter(({ key }) => {
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .sort((a, b) => b.key.localeCompare(a.key))
})

const filterItems = computed(() => [
  {
    label: 'Все меню',
    type: 'checkbox' as const,
    checked: filterMonth.value === null,
    onSelect: () => { filterMonth.value = null },
  },
  ...availableMonths.value.map(({ key, label }) => ({
    label,
    type: 'checkbox' as const,
    checked: filterMonth.value === key,
    onSelect: () => { filterMonth.value = key },
  })),
])

const processedMenus = computed(() => {
  let list = menus.value.filter((m) =>
    m.title.toLowerCase().includes(searchQuery.value.toLowerCase()),
  )
  if (filterMonth.value) {
    list = list.filter((m) => m.dateFrom?.startsWith(filterMonth.value!))
  }
  return list.slice().sort((a, b) => {
    if (sortKey.value === 'dateFrom-desc') return (b.dateFrom ?? '').localeCompare(a.dateFrom ?? '')
    if (sortKey.value === 'dateFrom-asc') return (a.dateFrom ?? '').localeCompare(b.dateFrom ?? '')
    if (sortKey.value === 'createdAt-desc') return b.createdAt.localeCompare(a.createdAt)
    if (sortKey.value === 'title-asc') return a.title.localeCompare(b.title, 'ru')
    if (sortKey.value === 'title-desc') return b.title.localeCompare(a.title, 'ru')
    return 0
  })
})

const groupedMenus = computed(() => {
  const groups = new Map<string, Menu[]>()
  for (const menu of processedMenus.value) {
    const key = (menu.dateFrom ?? menu.createdAt).slice(0, 7)
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(menu)
  }
  return Array.from(groups.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, items]) => ({ label: monthLabel(key), items }))
})

function monthLabel(key: string): string {
  const [year, month] = key.split('-')
  const date = new Date(Number(year), Number(month) - 1, 1)
  const name = date.toLocaleString('ru-RU', { month: 'long' })
  return `${name.charAt(0).toUpperCase()}${name.slice(1)} ${year}`
}

function openCreate() {
  editingMenu.value = null
  formState.value = { title: '' }
  showFormModal.value = true
}

function openEdit(menu: Menu) {
  editingMenu.value = menu
  formState.value = { title: menu.title }
  showFormModal.value = true
}

function closeForm() {
  showFormModal.value = false
  editingMenu.value = null
}

async function onFormSubmit() {
  saving.value = true
  try {
    if (editingMenu.value) {
      await updateMenu(editingMenu.value.id, { title: formState.value.title })
      toast.add({ title: 'Меню обновлено', color: 'success' })
    } else {
      await createMenu({ title: formState.value.title })
      toast.add({ title: 'Меню создано', color: 'success' })
    }
    closeForm()
  } catch {
    toast.add({ title: 'Ошибка сохранения', color: 'error' })
  } finally {
    saving.value = false
  }
}

async function onDeleteMenu(id: number) {
  try {
    await deleteMenu(id)
    toast.add({ title: 'Меню удалено', color: 'success' })
  } catch {
    toast.add({ title: 'Ошибка удаления', color: 'error' })
  }
}

async function onCreateShoppingList(menuId: number) {
  shoppingListLoadingIds.add(menuId)
  try {
    const result = await createMenuShoppingList(menuId)
    toast.add({ title: 'Список покупок сформирован', description: result.title, color: 'success' })
  } catch {
    toast.add({ title: 'Ошибка формирования списка покупок', color: 'error' })
  } finally {
    shoppingListLoadingIds.delete(menuId)
  }
}

// ── Генерация меню ──────────────────────────────────────────────────────────

const ALL_MEALS = ['Завтрак', 'Второй завтрак', 'Обед', 'Полдник', 'Ужин'] as const

const showGenerateModal = ref(false)
const generating = ref(false)
// Признак ручного редактирования заголовка (подавляет авто-заполнение по датам)
const titleEditedManually = ref(false)

function isoToday() {
  return new Date().toISOString().slice(0, 10)
}

function isoPlusDays(n: number) {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

function formatShortDate(iso: string) {
  if (!iso || iso.length < 10) return ''
  const [, m, d] = iso.split('-')
  return `${d}.${m}`
}

const generateState = ref({
  title: '',
  dateFrom: isoToday(),
  dateTo: isoPlusDays(6),
  numberOfPeople: '1',
  targetCaloriesPerDay: '2000',
  totalBudget: '',
  selectedMeals: ['Завтрак', 'Обед', 'Ужин'] as string[],
})

function autoGenerateTitle() {
  return `Меню ${formatShortDate(generateState.value.dateFrom)}–${formatShortDate(generateState.value.dateTo)}`
}

// Авто-заполнение заголовка при изменении дат (если пользователь не редактировал вручную)
watch(
  [() => generateState.value.dateFrom, () => generateState.value.dateTo],
  ([, ], [oldFrom, oldTo]) => {
    const prevAuto = `Меню ${formatShortDate(oldFrom)}–${formatShortDate(oldTo)}`
    if (!titleEditedManually.value || generateState.value.title === prevAuto) {
      generateState.value.title = autoGenerateTitle()
    }
  },
)

function onTitleInput(e: Event) {
  titleEditedManually.value = !!(e.target as HTMLInputElement).value
}

function isMealSelected(meal: string) {
  return generateState.value.selectedMeals.includes(meal)
}

function toggleMeal(meal: string) {
  const idx = generateState.value.selectedMeals.indexOf(meal)
  if (idx >= 0) generateState.value.selectedMeals.splice(idx, 1)
  else generateState.value.selectedMeals.push(meal)
}

function openGenerate() {
  titleEditedManually.value = false
  generateState.value = {
    title: '',
    dateFrom: isoToday(),
    dateTo: isoPlusDays(6),
    numberOfPeople: '1',
    targetCaloriesPerDay: '2000',
    totalBudget: '',
    selectedMeals: ['Завтрак', 'Обед', 'Ужин'],
  }
  generateState.value.title = autoGenerateTitle()
  showGenerateModal.value = true
}

function closeGenerate() {
  showGenerateModal.value = false
}

async function onGenerateSubmit() {
  generating.value = true
  try {
    const state = generateState.value
    const result = await generateMenu({
      title: state.title,
      dateFrom: state.dateFrom,
      dateTo: state.dateTo,
      numberOfPeople: Number(state.numberOfPeople),
      targetCaloriesPerDay: Number(state.targetCaloriesPerDay),
      totalBudget: state.totalBudget ? Number(state.totalBudget) : null,
      selectedMeals: state.selectedMeals,
    })

    if (result.warnings.dayRepeat) {
      toast.add({ title: 'Повторы блюд', description: 'Пул рецептов мал — некоторые блюда повторяются в один день', color: 'warning' })
    }
    if (result.warnings.calorieDeviation) {
      toast.add({ title: 'Отклонение по калориям', description: 'Некоторые дни отклоняются от цели более чем на 25%', color: 'warning' })
    }
    if (result.warnings.budgetExceeded) {
      toast.add({
        title: 'Бюджет превышен',
        description: `Фактическая стоимость: ${result.warnings.actualCost} ₽`,
        color: 'warning',
      })
    }

    closeGenerate()
    await fetchMenus()
    await navigateTo(`/menu/${result.menuId}`)
  } catch (e: any) {
    toast.add({ title: 'Ошибка генерации', description: e.data?.statusMessage ?? 'Попробуйте ещё раз', color: 'error' })
  } finally {
    generating.value = false
  }
}
</script>
