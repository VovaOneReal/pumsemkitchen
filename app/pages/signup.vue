<template>
  <div class="flex items-center justify-center min-h-screen px-6">
    <UAuthForm
      title="Сервис планирования питания"
      :fields="fields"
      :schema="signupSchema"
      :submit="{ label: 'Зарегистрироваться', block: true }"
      class="w-full max-w-sm"
      @submit="onSubmit"
    >
      <template #footer>
        <UButton block variant="ghost" to="/login">Войти</UButton>
      </template>
    </UAuthForm>
  </div>
</template>

<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import { signupSchema, type SignupForm } from '~~/schemas/auth'

definePageMeta({
  layout: false,
})

const fields = [
  {
    name: 'login',
    type: 'text',
    label: 'Логин',
    placeholder: 'Придумайте логин...',
    help: 'От 5 до 32 символов, только латинские буквы и цифры',
  },
  {
    name: 'password',
    type: 'password',
    label: 'Пароль',
    placeholder: 'Придумайте пароль...',
    help: 'От 8 до 1024 символов',
  },
  {
    name: 'inviteCode',
    type: 'password',
    label: 'Пригласительный код',
    placeholder: 'Введите код приглашения...',
  },
]

const { fetch: refreshSession } = useUserSession()
const toast = useToast()

async function onSubmit(event: FormSubmitEvent<SignupForm>) {
  try {
    await $fetch('/api/auth/register', { method: 'POST', body: event.data })
    await refreshSession()
    toast.add({ title: 'Регистрация прошла успешно', color: 'success' })
    await navigateTo('/')
  } catch (error: unknown) {
    const statusCode = (error as { statusCode?: number }).statusCode
    const message =
      statusCode === 409 ? 'Пользователь с таким логином уже существует'
      : statusCode === 400 ? 'Неверный пригласительный код'
      : 'Ошибка при регистрации'
    toast.add({ title: message, color: 'error' })
  }
}
</script>
