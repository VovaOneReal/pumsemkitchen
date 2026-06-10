<template>
  <div class="w-full py-6 px-8 max-w-2xl">
    <h1 class="text-3xl font-bold mb-6">Профиль</h1>

    <!-- Логин -->
    <div class="mb-6">
      <p class="text-sm font-medium mb-1">Ваш логин</p>
      <UInput :model-value="user?.login" disabled class="w-full" :ui="{ trailing: 'pe-1' }">
        <template #trailing>
          <UButton
            icon="i-lucide-copy"
            variant="ghost"
            color="neutral"
            size="sm"
            @click="copyLogin"
          />
        </template>
      </UInput>
      <p class="text-sm text-gray-500 mt-1">
        Его нельзя изменить. Поделитесь с владельцем семьи, чтобы он добавил вас в неё
      </p>
    </div>

    <!-- Отображаемое имя -->
    <UForm :schema="displayNameSchema" :state="nameForm" @submit="onUpdateName">
      <p class="text-sm font-medium mb-1">Отображаемое имя</p>
      <UFormField name="displayName">
        <UInput v-model="nameForm.displayName" class="w-full" />
      </UFormField>
      <p class="text-sm text-gray-500 mt-1 mb-3">Пользователи будут видеть вас под этим именем</p>
      <div class="flex justify-end">
        <UButton
          type="submit"
          label="Обновить имя"
          variant="outline"
          color="primary"
          :disabled="nameForm.displayName === originalDisplayName"
        />
      </div>
    </UForm>

    <!-- Смена пароля -->
    <h2 class="text-xl font-bold mt-8 mb-4">Смена пароля</h2>
    <UForm :schema="changePasswordSchema" :state="passwordForm" @submit="onChangePassword">
      <div class="flex flex-col gap-4">
        <UFormField name="currentPassword" label="Текущий пароль">
          <UInput v-model="passwordForm.currentPassword" type="password" class="w-full" />
        </UFormField>
        <UFormField name="newPassword" label="Новый пароль">
          <UInput v-model="passwordForm.newPassword" type="password" class="w-full" />
        </UFormField>
        <UFormField name="confirmPassword" label="Повторите новый пароль">
          <UInput v-model="passwordForm.confirmPassword" type="password" class="w-full" />
        </UFormField>
      </div>
      <div class="flex justify-end mt-4">
        <UButton
          type="submit"
          label="Сменить пароль"
          variant="outline"
          color="warning"
          :disabled="!isPasswordFormFilled"
        />
      </div>
    </UForm>

    <!-- Удалить профиль -->
    <div class="mt-8">
      <UButton
        icon="i-lucide-trash"
        label="Удалить профиль"
        color="error"
        @click="isDeleteModalOpen = true"
      />
    </div>

    <!-- Диалог подтверждения удаления -->
    <UModal v-model:open="isDeleteModalOpen" :dismissible="true">
      <template #content>
        <div class="p-6">
          <h3 class="text-lg font-semibold mb-2">Подтвердите удаление</h3>
          <p class="text-gray-600 mb-6">Вы точно хотите удалить свой профиль?</p>
          <div class="flex justify-end gap-3">
            <UButton
              label="Отменить"
              variant="outline"
              color="neutral"
              @click="isDeleteModalOpen = false"
            />
            <UButton label="Удалить" color="error" @click="onDeleteProfile" />
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script lang="ts" setup>
import { displayNameSchema, changePasswordSchema } from '~~/schemas/profile'

const { user } = useUserSession()
const toast = useToast()

// Логин
async function copyLogin() {
  await navigator.clipboard.writeText(user.value?.login ?? '')
  toast.add({ title: 'Логин успешно скопирован', color: 'success' })
}

// Отображаемое имя
const originalDisplayName = ref(user.value?.name ?? '')
const nameForm = reactive({ displayName: user.value?.name ?? '' })

async function onUpdateName() {
  // TODO: отправить PATCH /api/profile/display-name
  originalDisplayName.value = nameForm.displayName
}

// Смена пароля
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const isPasswordFormFilled = computed(
  () =>
    passwordForm.currentPassword.length > 0 &&
    passwordForm.newPassword.length > 0 &&
    passwordForm.confirmPassword.length > 0,
)

async function onChangePassword() {
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    toast.add({ title: 'Пароли не совпадают', color: 'error' })
    return
  }
  // TODO: отправить PATCH /api/profile/password
}

// Удаление профиля
const isDeleteModalOpen = ref(false)

async function onDeleteProfile() {
  isDeleteModalOpen.value = false
  // TODO: отправить DELETE /api/profile
}
</script>
