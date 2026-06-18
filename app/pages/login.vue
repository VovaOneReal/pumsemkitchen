<template>
  <div class="flex items-center justify-center min-h-screen px-6">
    <UAuthForm
      title="Сервис планирования питания"
      description="Войти в профиль"
      :fields="fields"
      :submit="{ label: 'Войти', block: true, loading }"
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
useHead({ title: 'Вход' })
import axios from 'axios'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { LoginForm } from '~~/schemas/auth'

definePageMeta({
  layout: false,
})

const router = useRouter()
const route = useRoute()
const toast = useToast()
const { fetch: refreshSession } = useUserSession()

const loading = ref(false)

onMounted(() => {
  if (route.query.unauthorized) {
    toast.add({ title: 'Отказано в доступе', description: 'Пожалуйста, войдите в аккаунт.', color: 'error' })
  }
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
  loading.value = true
  try {
    await axios.post('/api/auth/login', event.data)
    await refreshSession()
    toast.add({ title: 'Вы вошли в систему', color: 'success' })
    await router.push('/')
  } catch (error) {
    if (axios.isAxiosError(error)) {
      toast.add({ title: error.response?.data?.statusMessage ?? 'Ошибка входа', color: 'error' })
    }
  } finally {
    loading.value = false
  }
}
</script>
