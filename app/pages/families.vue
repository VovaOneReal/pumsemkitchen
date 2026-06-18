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
          @click="openInvitesModal"
        />
        <UButton
          leading-icon="i-lucide-plus"
          label="Создать"
          color="primary"
          :loading="creating"
          @click="showCreateModal = true"
        />
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

    <!-- Скелетон при первой загрузке -->
    <div v-if="loading" class="grid grid-cols-2 gap-4">
      <USkeleton v-for="i in 4" :key="i" class="h-36 w-full rounded-xl" />
    </div>

    <!-- Пустые состояния -->
    <p v-else-if="families.length === 0" class="text-sm text-muted">
      У вас пока нет семейных групп. Создайте первую!
    </p>
    <p v-else-if="filteredFamilies.length === 0" class="text-sm text-muted">
      Ничего не найдено по заданным фильтрам.
    </p>

    <!-- Двухколончатая сетка карточек -->
    <div v-else class="grid grid-cols-2 gap-4">
      <FamilyCard
        v-for="family in filteredFamilies"
        :key="family.id"
        :id="family.id"
        :name="family.title"
        :owner-name="family.ownerName"
        :created-at="family.createdAt"
        :is-owner="family.isOwner"
        :delete-loading="deletingId === family.id"
        :edit-loading="editingId === family.id"
        :leave-loading="leavingId === family.id"
        @delete="onDelete(family.id)"
        @edit="(newTitle) => onEdit(family.id, newTitle)"
        @leave="onLeave(family.id)"
      />
    </div>

    <!-- Диалог создания семейной группы -->
    <UModal v-model:open="showCreateModal" :dismissible="false">
      <template #content>
        <UForm
          :schema="createFamilySchema"
          :state="createFormState"
          class="p-6 flex flex-col gap-4"
          @submit="confirmCreate"
        >
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">Создание семейной группы</h3>
            <UButton
              icon="i-lucide-x"
              variant="ghost"
              color="neutral"
              type="button"
              @click="showCreateModal = false"
            />
          </div>
          <UFormField name="title" label="Название" required>
            <p class="text-xs text-muted mb-1">Это название будут видеть участники группы</p>
            <UInput v-model="createFormState.title" placeholder="Введите название..." class="w-full" autofocus />
          </UFormField>
          <div class="flex justify-end gap-2">
            <UButton
              type="button"
              variant="ghost"
              color="primary"
              label="Отменить"
              @click="showCreateModal = false"
            />
            <UButton type="submit" label="Создать" :loading="creating" />
          </div>
        </UForm>
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

          <!-- Скелетон при загрузке -->
          <div v-if="invitationsLoading" class="flex flex-col gap-2">
            <USkeleton v-for="i in 3" :key="i" class="h-14 w-full" />
          </div>

          <!-- Список приглашений -->
          <div v-else class="overflow-y-auto flex flex-col divide-y divide-default" style="max-height: 24rem">
            <FamilyInviteItem
              v-for="invite in invites"
              :key="invite.id"
              :family-name="invite.familyName"
              :owner-name="invite.ownerName"
              :accepting="acceptingId === invite.id"
              :declining="decliningId === invite.id"
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
import { createFamilySchema } from '~~/schemas/family'
import type { Invitation } from '@/types'

useHead({ title: 'Семьи' })

const toast = useToast()
const { families, loading, creating, deletingId, editingId, leavingId, fetchFamilies, createFamily, updateFamily, deleteFamily, leaveFamily, fetchInvitations, respondInvitation, invitationsLoading } = useFamilies()

const searchQuery = ref('')
const showInvitesModal = ref(false)
const showCreateModal = ref(false)
const createFormState = ref({ title: '' })
const invites = ref<Invitation[]>([])
const acceptingId = ref<number | null>(null)
const decliningId = ref<number | null>(null)

onMounted(() => fetchFamilies())

async function confirmCreate() {
  try {
    await createFamily(createFormState.value.title)
    toast.add({ title: 'Семья создана', color: 'success' })
    createFormState.value.title = ''
    showCreateModal.value = false
  } catch (e: any) {
    toast.add({ title: e?.data?.statusMessage ?? 'Ошибка при создании семьи', color: 'error' })
  }
}

async function openInvitesModal() {
  showInvitesModal.value = true
  try {
    invites.value = await fetchInvitations()
  } catch {
    toast.add({ title: 'Не удалось загрузить приглашения', color: 'error' })
  }
}

async function onAcceptInvite(id: number) {
  acceptingId.value = id
  try {
    await respondInvitation(id, true)
    invites.value = invites.value.filter((i) => i.id !== id)
    toast.add({ title: 'Приглашение принято', color: 'success' })
    await fetchFamilies()
  } catch (e: any) {
    toast.add({ title: e?.data?.statusMessage ?? 'Ошибка при принятии приглашения', color: 'error' })
  } finally {
    acceptingId.value = null
  }
}

async function onDeclineInvite(id: number) {
  decliningId.value = id
  try {
    await respondInvitation(id, false)
    invites.value = invites.value.filter((i) => i.id !== id)
    toast.add({ title: 'Приглашение отклонено', color: 'neutral' })
  } catch (e: any) {
    toast.add({ title: e?.data?.statusMessage ?? 'Ошибка при отклонении приглашения', color: 'error' })
  } finally {
    decliningId.value = null
  }
}

async function onDelete(id: number) {
  try {
    await deleteFamily(id)
    toast.add({ title: 'Семья удалена', color: 'success' })
  } catch (e: any) {
    toast.add({ title: e?.data?.statusMessage ?? 'Ошибка при удалении', color: 'error' })
  }
}

async function onEdit(id: number, newTitle: string) {
  try {
    await updateFamily(id, newTitle)
    toast.add({ title: 'Название обновлено', color: 'success' })
  } catch (e: any) {
    toast.add({ title: e?.data?.statusMessage ?? 'Ошибка при обновлении', color: 'error' })
  }
}

async function onLeave(id: number) {
  try {
    await leaveFamily(id)
    toast.add({ title: 'Вы покинули семейную группу', color: 'success' })
  } catch (e: any) {
    toast.add({ title: e?.data?.statusMessage ?? 'Ошибка при выходе из группы', color: 'error' })
  }
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

const filteredFamilies = computed(() => {
  return families.value.filter((f) => {
    const matchesSearch = f.title.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesFilter =
      activeFilter.value === 'all' ||
      (activeFilter.value === 'owner' && f.isOwner) ||
      (activeFilter.value === 'member' && !f.isOwner)
    return matchesSearch && matchesFilter
  })
})
</script>
