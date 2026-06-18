<template>
  <div class="flex flex-col w-full px-2 gap-4">
    <!-- Заголовок -->
    <div class="flex items-center justify-between w-full">
      <h2 class="ui-header-2">Меню</h2>
      <UButton leading-icon="i-lucide-plus" label="Создать" @click="openCreate" />
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
          @delete="onDeleteMenu(menu.id)"
          @edit="openEdit(menu)"
          @create-shopping-list="onCreateShoppingList(menu.id)"
        />
      </div>
    </template>

    <p v-else class="text-muted text-sm">
      Меню пока нет. Нажмите «Создать», чтобы добавить первое.
    </p>

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

useHead({ title: 'Меню' })

const toast = useToast()
const { menus, loading, fetchMenus, createMenu, updateMenu, deleteMenu } = useMenus()

onMounted(fetchMenus)

const searchQuery = ref('')
const sortKey = ref<'dateFrom-desc' | 'dateFrom-asc' | 'createdAt-desc' | 'title-asc' | 'title-desc'>('dateFrom-desc')
const filterMonth = ref<string | null>(null)

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

function onCreateShoppingList(_menuId: number) {
  toast.add({ title: 'Функция в разработке', color: 'info' })
}
</script>
