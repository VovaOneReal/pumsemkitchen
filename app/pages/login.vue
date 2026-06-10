<template>
  <div class="flex items-center justify-center min-h-screen px-6">
    <UAuthForm
      title="Сервис планирования питания"
      :fields="fields"
      :schema="loginSchema"
      :submit="{ label: 'Войти', block: true }"
      class="w-full max-w-sm"
      @submit="onSubmit"
    >
      <template #footer>
        <UButton block variant="ghost" to="/signup">Зарегистрироваться</UButton>
      </template>
    </UAuthForm>
  </div>
</template>

<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import { loginSchema, type LoginForm } from '~/schemas/auth'

definePageMeta({
  layout: false,
})

const fields = [
  {
    name: 'login',
    type: 'text',
    label: 'Логин',
    placeholder: 'Логин...',
  },
  {
    name: 'password',
    type: 'password',
    label: 'Пароль',
    placeholder: 'Пароль...',
  },
]

async function onSubmit(event: FormSubmitEvent<LoginForm>) {
  console.log('Вход:', event.data)
  // TODO: вызов API /api/auth/login
}
</script>
