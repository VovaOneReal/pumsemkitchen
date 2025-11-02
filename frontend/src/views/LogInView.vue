<template>
  <div class="flex flex-col w-full prose gap-4 justify-center max-w-[50%]">
    <h1 class="text-center">Pumsem<span class="text-accent">Kitchen</span></h1>
    <form class="flex flex-col gap-4 bg-base-200 rounded-box p-6 w-full">
      <h2 class="text-center mt-0">Вход</h2>
      <div class="flex flex-col gap-2">
        <fieldset class="fieldset">
          <legend class="fieldset-legend">Логин</legend>
          <input v-model="login" class="input w-full" type="text" placeholder="Логин..." />
        </fieldset>
        <fieldset class="fieldset">
          <legend class="fieldset-legend">Пароль</legend>
          <input v-model="password" class="input w-full" type="password" placeholder="Пароль..." />
        </fieldset>
        <p v-if="!authCorrect" class="text-error">
          Неверные данные для входа. Проверьте правильность ввода.
        </p>
      </div>
      <div class="flex flex-col justify-center gap-2">
        <button @click="(e) => toLogin(e)" type="submit" class="btn hover:btn-accent">Войти</button>
        <RouterLink to="/signin" class="btn btn-ghost">Зарегистрироваться</RouterLink>
        <button class="btn btn-ghost btn-xs">Забыл пароль</button>
      </div>
    </form>
  </div>
</template>

<script lang="ts" setup>
import { RouterLink } from 'vue-router'
import router from '@/router'
import { ref } from 'vue'

const login = ref<string>('')
const password = ref<string>('')

const authCorrect = ref<boolean>(true)

function toLogin(event: PointerEvent) {
  // Send auth request...
  if (authCorrect.value) {
    router.push('/')
  } else {
    event.preventDefault()
  }
}
</script>
