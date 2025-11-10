<template>
  <div class="flex flex-col w-full prose gap-4 justify-center max-w-[50%]">
    <h1 class="text-center">Pumsem<span class="text-accent">Kitchen</span></h1>
    <form class="flex flex-col gap-4 bg-base-200 rounded-box p-6 w-full">
      <h2 class="text-center mt-0">Регистрация</h2>
      <div class="flex flex-col gap-2">
        <fieldset class="fieldset">
          <legend class="fieldset-legend">Логин</legend>
          <input
            @input="testLogin"
            v-model="login"
            :class="loginCorrect ? '' : 'input-error'"
            class="input w-full"
            type="text"
            placeholder="Придумайте логин..."
          />
          <p class="label not-prose">Только латинские буквы и цифры от 3 до 32 символов</p>
        </fieldset>
        <fieldset class="fieldset">
          <legend class="fieldset-legend">Пароль</legend>
          <input
            @input="testPassword"
            v-model="password"
            :class="passwordCorrect ? '' : 'input-error'"
            class="input w-full"
            type="password"
            placeholder="Придумайте пароль..."
          />
          <p class="label not-prose">От 8 до 32 символов</p>
        </fieldset>
        <p v-if="errorMsg.length != 0" class="text-error text-xs">
          {{ errorMsg }}
        </p>
      </div>
      <div class="flex flex-col justify-center gap-2">
        <button @click="(e) => toRegister(e)" type="submit" class="btn hover:btn-accent">
          Зарегистрироваться
        </button>
        <RouterLink to="/login" class="btn btn-ghost">Войти</RouterLink>
      </div>
    </form>
  </div>
</template>

<script lang="ts" setup>
import { RouterLink } from 'vue-router'
import router from '@/router'
import { ref } from 'vue'
import axios from 'axios'

const login = ref<string>('')
const password = ref<string>('')

const loginCorrect = ref<boolean>(true)
const passwordCorrect = ref<boolean>(true)
const loginRe = /^[a-zA-Z0-9]{3,32}$/
const passwordRe = /^[\p{L}\p{N}\p{S}\p{P}]{8,32}$/u

const errorMsg = ref<string>('')

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
            router.push('/')
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
