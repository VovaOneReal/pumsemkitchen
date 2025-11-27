<template>
  <UContainer class="flex flex-col w-full h-screen gap-4 justify-center items-center">
    <!-- TODO: Добавить акцентный цвет в тему -->
    <UHeader :toggle="false">
      <template #title>
        <ServiceLogo :collapsed="false" />
      </template>
    </UHeader>
    <UMain class="flex flex-col justify-center items-center w-full">
      <UForm class="flex flex-col gap-4 bg-base-200 rounded-box w-full max-w-1/2">
        <UCard variant="soft">
          <template #header>
            <h2 class="text-center">Вход</h2>
          </template>
          <div class="flex flex-col gap-2">
            <UFormField label="Логин">
              <UInput v-model="login" class="input w-full" type="text" placeholder="Логин..." />
            </UFormField>
            <UFormField label="Пароль">
              <UInput
                v-model="password"
                class="input w-full"
                type="password"
                placeholder="Пароль..."
              />
            </UFormField>
            <p v-if="!authCorrect" class="text-error">
              Неверные данные для входа. Проверьте правильность ввода.
            </p>
          </div>
          <template #footer>
            <div class="flex flex-col justify-center gap-2">
              <UButton type="submit" block class="btn hover:btn-accent" @click="(e) => toLogin(e)"
                >Войти</UButton
              >
              <UButton block variant="outline" to="/signup">Зарегистрироваться</UButton>
              <UButton block variant="ghost" size="xs">Забыл пароль</UButton>
            </div>
          </template>
        </UCard>
      </UForm>
    </UMain>
  </UContainer>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import axios from 'axios'

definePageMeta({
  layout: false,
})

const toast = useToast()

const login = ref<string>('')
const password = ref<string>('')

const authCorrect = ref<boolean>(true)

function toLogin(event: PointerEvent) {
  toast.add({
    title: 'Успешный вход',
    description: 'Добро пожаловать! Снова.',
    color: 'success',
  })

  // axios.get('http://localhost:3000/').then((response) => {
  // if (response.status == 200) {
  // toast.add({
  //   title: 'Успешный вход',
  //   description: response.data.message,
  //   color: 'success',
  // })
  // }
  // })
  // if (authCorrect.value) {
  //   router.push('/')
  // } else {
  navigateTo('/recipebook')
  event.preventDefault()
  // }
}
</script>
