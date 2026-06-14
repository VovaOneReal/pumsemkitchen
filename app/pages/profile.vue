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
          variant="subtle"
          color="neutral"
          :disabled="!isNameChanged"
          :loading="isNameLoading"
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
          variant="subtle"
          color="neutral"
          :disabled="!isPasswordFormValid"
          :loading="isPasswordLoading"
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
useHead({ title: 'Профиль' })
import { displayNameSchema, changePasswordSchema } from '~~/schemas/profile'

const { user, fetch: refreshSession } = useUserSession()
const toast = useToast()

// Логин
async function copyLogin() {
  await navigator.clipboard.writeText(user.value?.login ?? '')
  toast.add({ title: 'Логин успешно скопирован', color: 'success' })
}

// Отображаемое имя
const originalDisplayName = ref(user.value?.name ?? '')
const nameForm = reactive({ displayName: user.value?.name ?? '' })
const isNameChanged = computed(() => nameForm.displayName !== originalDisplayName.value)
const isNameLoading = ref(false)

async function onUpdateName() {
  isNameLoading.value = true
  try {
    await $fetch('/api/users/me', { method: 'PATCH', body: { name: nameForm.displayName } })
    await refreshSession()
    originalDisplayName.value = nameForm.displayName
    toast.add({ title: 'Имя успешно обновлено', color: 'success' })
  } catch {
    toast.add({ title: 'Ошибка при обновлении имени', color: 'error' })
  } finally {
    isNameLoading.value = false
  }
}

// Смена пароля
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const isPasswordFormValid = computed(() => changePasswordSchema.safeParse(passwordForm).success)
const isPasswordLoading = ref(false)

async function onChangePassword() {
  isPasswordLoading.value = true
  try {
    await $fetch('/api/users/me/password', {
      method: 'PATCH',
      body: {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      },
    })
    toast.add({ title: 'Пароль успешно изменён', color: 'success' })
    passwordForm.currentPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
  } catch (error: unknown) {
    const statusCode = (error as { statusCode?: number }).statusCode
    const message = statusCode === 400 ? 'Текущий пароль введён неверно' : 'Ошибка при смене пароля'
    toast.add({ title: message, color: 'error' })
  } finally {
    isPasswordLoading.value = false
  }
}

// Удаление профиля
const isDeleteModalOpen = ref(false)

async function onDeleteProfile() {
  isDeleteModalOpen.value = false
  try {
    await $fetch('/api/users/me', { method: 'DELETE' })
    toast.add({ title: 'Профиль успешно удалён', color: 'success' })
    await navigateTo('/signup')
  } catch {
    toast.add({ title: 'Ошибка при удалении профиля', color: 'error' })
  }
}
</script>
