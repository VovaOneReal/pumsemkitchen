<template>
  <div class="flex flex-col w-full px-2 gap-4">
    <!-- Заголовок и кнопки действий -->
    <div class="flex items-center justify-between w-full">
      <h2 class="ui-header-2">Семьи</h2>
      <div class="flex gap-2">
        <UButton
          leading-icon="i-lucide-inbox"
          label="Приглашения"
          variant="subtle"
          color="primary"
          @click="showInvitesModal = true"
        />
        <UButton leading-icon="i-lucide-plus" label="Создать" color="primary" @click="showCreateModal = true" />
      </div>
    </div>

    <!-- Поиск и фильтр -->
    <div class="flex gap-2">
      <UInput
        v-model="searchQuery"
        placeholder="Название..."
        class="w-64"
        :trailing-icon="'i-lucide-search'"
      />
      <UDropdownMenu :items="filterMenuItems">
        <UButton
          leading-icon="i-lucide-filter"
          :label="activeFilterLabel"
          variant="outline"
          color="neutral"
        />
      </UDropdownMenu>
    </div>

    <!-- Двухколончатая сетка карточек -->
    <div class="grid grid-cols-2 gap-4">
      <FamilyCard
        v-for="family in filteredFamilies"
        :key="family.id"
        :name="family.name"
        :owner="family.owner"
        :created-at="family.createdAt"
        @delete="onDelete(family.id)"
      />
    </div>

    <!-- Диалог создания семейной группы -->
    <UModal v-model:open="showCreateModal">
      <template #content>
        <div class="p-6 flex flex-col gap-4">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">Создание семейной группы</h3>
            <UButton
              icon="i-lucide-x"
              variant="ghost"
              color="neutral"
              @click="showCreateModal = false"
            />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium">
              Название<span class="text-error">*</span>
            </label>
            <p class="text-xs text-muted">Это название будут видеть участники группы</p>
            <UInput v-model="newFamilyName" placeholder="Введите название..." class="mt-1" />
          </div>
          <div class="flex justify-end gap-2">
            <UButton
              variant="ghost"
              color="primary"
              label="Отменить"
              @click="showCreateModal = false"
            />
            <UButton label="Создать" @click="confirmCreate" />
          </div>
        </div>
      </template>
    </UModal>

    <!-- Диалог приглашений -->
    <UModal v-model:open="showInvitesModal" :ui="{ content: 'sm:max-w-2xl' }">
      <template #content>
        <div class="p-6 flex flex-col gap-4" style="min-height: 20rem">
          <!-- Заголовок -->
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">Приглашения</h3>
            <UButton
              icon="i-lucide-x"
              variant="ghost"
              color="neutral"
              @click="showInvitesModal = false"
            />
          </div>

          <!-- Список приглашений с прокруткой при переполнении -->
          <div class="overflow-y-auto flex flex-col divide-y divide-default" style="max-height: 24rem">
            <FamilyInviteItem
              v-for="invite in invites"
              :key="invite.id"
              :family-name="invite.familyName"
              :owner-name="invite.ownerName"
              @accept="onAcceptInvite(invite.id)"
              @decline="onDeclineInvite(invite.id)"
            />
            <p v-if="invites.length === 0" class="text-sm text-muted py-2">
              Сейчас у вас нет приглашений
            </p>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script lang="ts" setup>
useHead({ title: 'Семьи' })

const searchQuery = ref('')
const showInvitesModal = ref(false)
const showCreateModal = ref(false)
const newFamilyName = ref('')

function confirmCreate() {
  // TODO: реализовать создание семьи
  newFamilyName.value = ''
  showCreateModal.value = false
}

// Моканые приглашения
const invites = ref([
  { id: 1, familyName: 'Название семьи', ownerName: 'Имя владельца' },
  { id: 2, familyName: 'Название семьи', ownerName: 'Имя владельца' },
  { id: 3, familyName: 'Название семьи', ownerName: 'Имя владельца' },
])

function onAcceptInvite(id: number) {
  // TODO: реализовать принятие приглашения
  invites.value = invites.value.filter((i) => i.id !== id)
}

function onDeclineInvite(id: number) {
  // TODO: реализовать отклонение приглашения
  invites.value = invites.value.filter((i) => i.id !== id)
}

type FilterOption = 'all' | 'owner' | 'member'
const activeFilter = ref<FilterOption>('all')

const filterLabels: Record<FilterOption, string> = {
  all: 'Все семьи',
  owner: 'Я владелец',
  member: 'Я участник',
}

const activeFilterLabel = computed(() => filterLabels[activeFilter.value])

const filterMenuItems = computed(() =>
  (['all', 'owner', 'member'] as FilterOption[]).map((key) => ({
    label: filterLabels[key],
    type: 'checkbox' as const,
    checked: activeFilter.value === key,
    onSelect() {
      activeFilter.value = key
    },
  })),
)

// Моканые данные для визуализации
const families = ref([
  { id: 1, name: 'Название семьи', owner: 'Автор', createdAt: 'Дата создания', role: 'owner' },
  { id: 2, name: 'Название семьи', owner: 'Автор', createdAt: 'Дата создания', role: 'member' },
  { id: 3, name: 'Название семьи', owner: 'Автор', createdAt: 'Дата создания', role: 'owner' },
  { id: 4, name: 'Название семьи', owner: 'Автор', createdAt: 'Дата создания', role: 'member' },
])

const filteredFamilies = computed(() => {
  return families.value.filter((f) => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesFilter =
      activeFilter.value === 'all' ||
      (activeFilter.value === 'owner' && f.role === 'owner') ||
      (activeFilter.value === 'member' && f.role === 'member')
    return matchesSearch && matchesFilter
  })
})

function onDelete(id: number) {
  // TODO: реализовать удаление
}
</script>
