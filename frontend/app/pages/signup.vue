<template>
  <div class="flex flex-col w-full gap-4 justify-center max-w-[50%]">
    <!-- TODO: Добавить акцентный цвет в тему -->
    <h1 class="text-center">Pumsem<span class="text-accent">Kitchen</span></h1>
    <UForm class="flex flex-col gap-4 bg-base-200 rounded-box p-6 w-full">
      <UCard variant="soft">
        <template #header>
          <h2 class="text-center">Регистрация</h2>
        </template>
        <div class="flex flex-col gap-2">
          <UFormField label="Логин" help="Только латинские буквы и цифры от 3 до 32 символов">
            <UInput
              v-model="login"
              :class="loginCorrect ? '' : 'input-error'"
              class="input w-full"
              type="text"
              placeholder="Придумайте логин..."
              @input="testLogin"
            />
          </UFormField>
          <UFormField label="Пароль" help="От 8 до 32 символов" :error="errorMsg">
            <UInput
              v-model="password"
              :class="passwordCorrect ? '' : 'input-error'"
              class="input w-full"
              type="password"
              placeholder="Придумайте пароль..."
              @input="testPassword"
            />
          </UFormField>
        </div>
        <template #footer>
          <div class="flex flex-col gap-2">
            <UButton block type="submit" @click="(e) => toRegister(e)">
              Зарегистрироваться
            </UButton>
            <UButton block to="/login" variant="outline">Войти</UButton>
          </div>
        </template>
      </UCard>
    </UForm>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import axios from 'axios'

definePageMeta({
  layout: false,
})

const login = ref<string>('')
const password = ref<string>('')

const loginCorrect = ref<boolean>(true)
const passwordCorrect = ref<boolean>(true)
const loginRe = /^[a-zA-Z0-9]{3,32}$/
const passwordRe = /^[\p{L}\p{N}\p{S}\p{P}]{8,32}$/u

const errorMsg = ref<string | undefined>(undefined)

function testLogin() {
  loginCorrect.value = loginRe.test(login.value)
  errorMsg.value = ''
}

function testPassword() {
  passwordCorrect.value = passwordRe.test(password.value)
  errorMsg.value = ''
}

function toRegister(event: PointerEvent) {
  event.preventDefault()
  testLogin()
  testPassword()
  if (loginCorrect.value) {
    if (passwordCorrect.value) {
      axios
        .post('http://localhost:3000/signin', { login: login.value, password: password.value })
        .then((response) => {
          if (response.status == 200) {
            navigateTo('/recipebook')
          }
        })
        .catch((error) => {
          if (error.status == 400) {
            errorMsg.value = error.response.data.message
          }
        })
    } else {
      errorMsg.value = 'Такой пароль не подходит'
    }
  } else {
    errorMsg.value = 'Такой логин не подходит'
  }
}
</script>
