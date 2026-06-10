<template>
  <div class="flex items-center justify-center min-h-screen px-6">
    <UAuthForm
      title="Сервис планирования питания"
      :fields="fields"
      :validate="validate"
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

definePageMeta({
  layout: false,
})

const fields = [
  {
    name: 'login',
    type: 'text',
    label: 'Логин',
    placeholder: 'Логин...',
    required: true,
  },
  {
    name: 'password',
    type: 'password',
    label: 'Пароль',
    placeholder: 'Пароль...',
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

  return errors
}

// Заглушка — будет вызывать API входа
async function onSubmit(event: FormSubmitEvent<Record<string, string>>) {
  console.log('Вход:', event.data)
  // TODO: вызов API /api/auth/login
}
</script>
