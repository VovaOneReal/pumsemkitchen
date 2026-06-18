<template>
  <div class="flex flex-col gap-3 rounded-xl border border-default bg-default p-4 shadow-sm">
    <!-- Заголовок и badges -->
    <div class="flex flex-col gap-2">
      <h3 class="text-xl font-bold">{{ name }}</h3>
      <div class="flex flex-wrap gap-1.5">
        <UBadge
          :color="isOwner ? 'success' : 'neutral'"
          variant="subtle"
          icon="i-lucide-user"
        >
          {{ isOwner ? 'Вы владелец' : ownerName }}
        </UBadge>
        <UBadge variant="subtle" color="neutral" icon="i-lucide-calendar">
          {{ createdAt }}
        </UBadge>
      </div>
    </div>

    <!-- Подвал с кнопками -->
    <div class="flex gap-2 items-center">
      <UButton
        leading-icon="i-lucide-external-link"
        label="Открыть"
        variant="subtle"
        class="flex-1 justify-center"
        @click="openMembers"
      />
      <UButton
        v-if="isOwner"
        icon="i-lucide-pencil"
        variant="subtle"
        @click="openEdit"
      />
      <UButton
        v-if="isOwner"
        icon="i-lucide-trash-2"
        color="error"
        variant="subtle"
        :loading="deleteLoading"
        @click="showDeleteConfirm = true"
      />
    </div>
  </div>

  <!-- Диалог участников семьи -->
  <UModal v-model:open="showMembersModal" :ui="{ content: 'sm:max-w-2xl' }">
    <template #content>
      <div class="p-6 flex flex-col gap-4" style="min-height: 20rem">
        <!-- Заголовок -->
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">Участники {{ name }}</h3>
          <UButton
            icon="i-lucide-x"
            variant="ghost"
            color="neutral"
            @click="showMembersModal = false"
          />
        </div>

        <!-- Скелетон при загрузке -->
        <div v-if="loadingMembers" class="flex flex-col gap-2">
          <USkeleton v-for="i in 3" :key="i" class="h-12 w-full" />
        </div>

        <!-- Список участников -->
        <div v-else class="overflow-y-auto flex flex-col divide-y divide-default flex-1" style="max-height: 24rem">
          <FamilyMemberItem
            v-for="member in members"
            :key="member.userId"
            :name="member.name"
            :login="member.login"
            :is-owner="member.isOwner"
            :can-kick="isOwner && !member.isOwner"
            @kick="openKickConfirm(member)"
          />
        </div>

        <!-- Подвал с действиями -->
        <div class="flex items-center justify-between gap-2 pt-2">
          <UButton
            v-if="isOwner"
            leading-icon="i-lucide-user-plus"
            label="Пригласить"
            variant="ghost"
            color="primary"
            @click="showInviteModal = true"
          />
          <div class="flex-1" />
          <UButton label="Покинуть группу" color="error" variant="subtle" :loading="leaveLoading" @click="showLeaveConfirm = true" />
        </div>
      </div>
    </template>
  </UModal>

  <!-- Диалог редактирования -->
  <UModal v-model:open="showEditModal" :dismissible="false">
    <template #content>
      <UForm
        :schema="updateFamilySchema"
        :state="editFormState"
        class="p-6 flex flex-col gap-4"
        @submit="onConfirmEdit"
      >
        <h3 class="text-lg font-semibold">Переименовать семью</h3>
        <UFormField name="title" label="Название" required>
          <UInput
            v-model="editFormState.title"
            placeholder="Название семьи"
            class="w-full"
            autofocus
          />
        </UFormField>
        <div class="flex justify-end gap-2">
          <UButton
            type="button"
            variant="ghost"
            color="primary"
            label="Отменить"
            @click="showEditModal = false"
          />
          <UButton type="submit" label="Сохранить" :loading="editLoading" />
        </div>
      </UForm>
    </template>
  </UModal>

  <!-- Диалог подтверждения удаления семьи -->
  <UModal v-model:open="showDeleteConfirm">
    <template #content>
      <div class="p-6 flex flex-col gap-4">
        <h3 class="text-lg font-semibold">Подтвердите удаление</h3>
        <p class="text-sm">Вы точно хотите удалить семью «{{ name }}»?</p>
        <div class="flex justify-end gap-2">
          <UButton variant="ghost" color="primary" label="Отменить" @click="showDeleteConfirm = false" />
          <UButton color="error" label="Удалить" :loading="deleteLoading" @click="confirmDelete" />
        </div>
      </div>
    </template>
  </UModal>

  <!-- Диалог подтверждения исключения участника -->
  <UModal v-model:open="showKickConfirm">
    <template #content>
      <div class="p-6 flex flex-col gap-4">
        <h3 class="text-lg font-semibold">Подтвердите исключение участника</h3>
        <p class="text-sm">
          Вы точно хотите выгнать участника {{ kickTarget?.name }} ({{ kickTarget?.login }})?
        </p>
        <div class="flex justify-end gap-2">
          <UButton variant="ghost" color="primary" label="Отменить" @click="showKickConfirm = false" />
          <UButton color="error" label="Выгнать" :loading="kicking" @click="confirmKick" />
        </div>
      </div>
    </template>
  </UModal>

  <!-- Диалог подтверждения выхода из группы -->
  <UModal v-model:open="showLeaveConfirm">
    <template #content>
      <div class="p-6 flex flex-col gap-4">
        <h3 class="text-lg font-semibold">Подтвердите выход из семьи</h3>
        <p class="text-sm">Вы точно хотите покинуть семейную группу «{{ name }}»?</p>
        <div class="flex justify-end gap-2">
          <UButton variant="ghost" color="primary" label="Отменить" @click="showLeaveConfirm = false" />
          <UButton color="error" label="Покинуть" :loading="leaveLoading" @click="confirmLeave" />
        </div>
      </div>
    </template>
  </UModal>

  <!-- Диалог приглашения участника -->
  <UModal v-model:open="showInviteModal">
    <template #content>
      <div class="p-6 flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">Пригласить в семью</h3>
          <UButton
            icon="i-lucide-x"
            variant="ghost"
            color="neutral"
            @click="closeInviteModal"
          />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium">
            Логин пользователя<span class="text-error">*</span>
          </label>
          <p class="text-xs text-muted">Узнайте логин у пользователя, которого хотите добавить</p>
          <UInput v-model="inviteLogin" placeholder="Введите логин..." class="mt-1" />
        </div>
        <div class="flex justify-end">
          <UButton leading-icon="i-lucide-user-plus" label="Пригласить" :loading="inviting" @click="confirmInvite" />
        </div>
      </div>
    </template>
  </UModal>
</template>

<script lang="ts" setup>
import { updateFamilySchema } from '~~/schemas/family'
import type { FamilyMember } from '@/types'

const props = defineProps<{
  id: number
  name: string
  ownerName: string
  createdAt: string
  isOwner: boolean
  deleteLoading?: boolean
  editLoading?: boolean
  leaveLoading?: boolean
}>()

const emit = defineEmits<{
  delete: []
  edit: [newTitle: string]
  leave: []
}>()

const toast = useToast()
const { kickMember, inviteMember, fetchMembers } = useFamilies()

const showMembersModal = ref(false)
const showEditModal = ref(false)
const showDeleteConfirm = ref(false)
const showKickConfirm = ref(false)
const showLeaveConfirm = ref(false)
const showInviteModal = ref(false)

const inviteLogin = ref('')
const inviting = ref(false)
const kicking = ref(false)
const loadingMembers = ref(false)
const members = ref<FamilyMember[]>([])

const editFormState = ref({ title: '' })
const kickTarget = ref<FamilyMember | null>(null)

async function openMembers() {
  showMembersModal.value = true
  loadingMembers.value = true
  try {
    const detail = await fetchMembers(props.id)
    members.value = detail.members
  } catch {
    toast.add({ title: 'Не удалось загрузить участников', color: 'error' })
  } finally {
    loadingMembers.value = false
  }
}

function openEdit() {
  editFormState.value.title = props.name
  showEditModal.value = true
}

function onConfirmEdit() {
  emit('edit', editFormState.value.title)
  showEditModal.value = false
}

function confirmDelete() {
  showDeleteConfirm.value = false
  emit('delete')
}

function openKickConfirm(member: FamilyMember) {
  kickTarget.value = member
  showKickConfirm.value = true
}

async function confirmKick() {
  if (!kickTarget.value) return
  kicking.value = true
  try {
    await kickMember(props.id, kickTarget.value.userId)
    members.value = members.value.filter((m) => m.userId !== kickTarget.value!.userId)
    toast.add({ title: `Участник ${kickTarget.value.name} исключён`, color: 'success' })
    kickTarget.value = null
    showKickConfirm.value = false
  } catch (e: any) {
    toast.add({ title: e?.data?.statusMessage ?? 'Ошибка при исключении участника', color: 'error' })
  } finally {
    kicking.value = false
  }
}

function confirmLeave() {
  emit('leave')
  showLeaveConfirm.value = false
  showMembersModal.value = false
}

function closeInviteModal() {
  inviteLogin.value = ''
  showInviteModal.value = false
}

async function confirmInvite() {
  if (!inviteLogin.value.trim()) return
  inviting.value = true
  try {
    await inviteMember(props.id, inviteLogin.value.trim())
    toast.add({ title: `Приглашение отправлено пользователю «${inviteLogin.value}»`, color: 'success' })
    closeInviteModal()
  } catch (e: any) {
    toast.add({ title: e?.data?.statusMessage ?? 'Ошибка при отправке приглашения', color: 'error' })
  } finally {
    inviting.value = false
  }
}
</script>
