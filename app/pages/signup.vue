<template>
  <div class="flex items-center justify-center min-h-screen px-6">
    <UAuthForm
      title="Сервис планирования питания"
      :fields="fields"
      :validate="validate"
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

definePageMeta({
  layout: false,
})

const fields = [
  {
    name: 'login',
    type: 'text',
    label: 'Логин',
    placeholder: 'Придумайте логин...',
    required: true,
    help: 'От 5 до 32 символов',
  },
  {
    name: 'password',
    type: 'password',
    label: 'Пароль',
    placeholder: 'Придумайте пароль...',
    required: true,
    help: 'Не менее 8 символов',
  },
  {
    name: 'inviteCode',
    type: 'password',
    label: 'Пригласительный код',
    placeholder: 'Введите код приглашения...',
    required: true,
  },
]

function validate(state: Record<string, string>) {
  const errors: { path: string; message: string }[] = []

  if (!state.login || state.login.length < 5 || state.login.length > 32) {
    errors.push({ path: 'login', message: 'Логин должен содержать от 5 до 32 символов' })
  }
  if (!state.password || state.password.length < 8) {
    errors.push({ path: 'password', message: 'Пароль должен содержать не менее 8 символов' })
  }
  if (!state.inviteCode) {
    errors.push({ path: 'inviteCode', message: 'Введите пригласительный код' })
  }

  return errors
}

// Заглушка — будет вызывать API регистрации
async function onSubmit(event: FormSubmitEvent<Record<string, string>>) {
  console.log('Регистрация:', event.data)
  // TODO: вызов API /api/auth/signup
}
</script>
