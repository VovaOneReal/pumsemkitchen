<template>
  <div class="flex flex-col gap-3 rounded-xl border border-default bg-default p-4 shadow-sm">
    <!-- Заголовок и badges -->
    <div class="flex flex-col gap-2">
      <h3 class="text-xl font-bold">{{ name }}</h3>
      <div class="flex flex-wrap gap-1.5">
        <UBadge variant="subtle" color="neutral" icon="i-lucide-user">
          {{ owner }}
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
        @click="showMembersModal = true"
      />
      <UButton
        icon="i-lucide-trash-2"
        color="error"
        variant="subtle"
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

        <!-- Список участников с прокруткой при переполнении -->
        <div class="overflow-y-auto flex flex-col divide-y divide-default flex-1" style="max-height: 24rem">
          <FamilyMemberItem
            v-for="member in members"
            :key="member.id"
            :name="member.name"
            :login="member.login"
            @kick="openKickConfirm(member)"
          />
        </div>

        <!-- Подвал с действиями -->
        <div class="flex items-center justify-end gap-2 pt-2">
          <UButton
            leading-icon="i-lucide-user-plus"
            label="Пригласить"
            variant="ghost"
            color="primary"
            @click="showInviteModal = true"
          />
          <UButton label="Покинуть группу" color="error" @click="showLeaveConfirm = true" />
        </div>
      </div>
    </template>
  </UModal>

  <!-- Диалог подтверждения удаления семьи -->
  <UModal v-model:open="showDeleteConfirm">
    <template #content>
      <div class="p-6 flex flex-col gap-4">
        <h3 class="text-lg font-semibold">Подтвердите удаление</h3>
        <p class="text-sm">Вы точно хотите удалить семью {{ name }}?</p>
        <div class="flex justify-end gap-2">
          <UButton variant="ghost" color="primary" label="Отменить" @click="showDeleteConfirm = false" />
          <UButton color="error" label="Удалить" @click="confirmDelete" />
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
          <UButton color="error" label="Выгнать" @click="confirmKick" />
        </div>
      </div>
    </template>
  </UModal>

  <!-- Диалог подтверждения выхода из группы -->
  <UModal v-model:open="showLeaveConfirm">
    <template #content>
      <div class="p-6 flex flex-col gap-4">
        <h3 class="text-lg font-semibold">Подтвертите выход из семьи</h3>
        <p class="text-sm">Вы точно хотите покинуть семейную группу {{ name }}?</p>
        <div class="flex justify-end gap-2">
          <UButton variant="ghost" color="primary" label="Отменить" @click="showLeaveConfirm = false" />
          <UButton color="error" label="Покинуть" @click="confirmLeave" />
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
            @click="showInviteModal = false"
          />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium">
            Логин пользователя<span class="text-error">*</span>
          </label>
          <p class="text-xs text-muted">Узнайте логин у пользователя, которого хотите добавить</p>
          <UInput v-model="inviteLogin" placeholder="Введите название..." class="mt-1" />
        </div>
        <div class="flex justify-end">
          <UButton leading-icon="i-lucide-user-plus" label="Пригласить" @click="confirmInvite" />
        </div>
      </div>
    </template>
  </UModal>
</template>

<script lang="ts" setup>
defineProps<{
  name: string
  owner: string
  createdAt: string
}>()

const emit = defineEmits<{
  delete: []
}>()

const showMembersModal = ref(false)
const showDeleteConfirm = ref(false)
const showKickConfirm = ref(false)
const showLeaveConfirm = ref(false)
const showInviteModal = ref(false)
const inviteLogin = ref('')

type Member = { id: number; name: string; login: string }
const kickTarget = ref<Member | null>(null)

// Моканые участники
const members = ref<Member[]>([
  { id: 1, name: 'Имя участника', login: 'логин' },
  { id: 2, name: 'Имя участника', login: 'логин' },
  { id: 3, name: 'Имя участника', login: 'логин' },
])

function confirmDelete() {
  showDeleteConfirm.value = false
  emit('delete')
}

function openKickConfirm(member: Member) {
  kickTarget.value = member
  showKickConfirm.value = true
}

function confirmKick() {
  if (kickTarget.value) {
    members.value = members.value.filter((m) => m.id !== kickTarget.value!.id)
    kickTarget.value = null
  }
  showKickConfirm.value = false
}

function confirmLeave() {
  // TODO: реализовать выход из группы
  showLeaveConfirm.value = false
  showMembersModal.value = false
}

function confirmInvite() {
  // TODO: реализовать отправку приглашения
  inviteLogin.value = ''
  showInviteModal.value = false
}
</script>
