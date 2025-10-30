<template>
  <div class="flex flex-col w-full prose gap-4 justify-center">
    <h1 class="text-center">Pumsem<span class="text-accent">Kitchen</span></h1>
    <form class="flex flex-col gap-4">
        <h2 class="text-center">Вход</h2>
        <div class="flex flex-col gap-2">
            <input class="input w-full" type="text" placeholder="Логин..."/>
            <input class="input w-full" type="password" placeholder="Пароль..."/>
        </div>
        <div class="flex flex-col justify-center gap-2">
            <input @click="login" type="submit" value="Войти" class="btn"/>
            <RouterLink to="/signin" class="btn btn-ghost">Зарегистрироваться</RouterLink>
        </div>
    </form>
  </div>
</template>

<script lang="ts" setup>
import { RouterLink } from 'vue-router';
import router from '@/router';

function login() {
  router.push("/")
}

</script>