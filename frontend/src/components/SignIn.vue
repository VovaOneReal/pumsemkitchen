<template>
  <div class="flex flex-col w-full max-w-70% prose gap-4">
    <h1 class="text-center">Pumsem<span class="text-accent">Kitchen</span></h1>
    <form class="flex flex-col gap-4">
        <h2 class="text-center">Регистрация</h2>
        <div class="flex flex-col gap-2">
            <input class="input w-full" type="text" placeholder="Придумайте логин..."/>
            <input class="input w-full" type="password" placeholder="Придумайте пароль..."/>
            <input class="input w-full" type="text" placeholder="Пригласительный код"/>
        </div>
        <div class="flex flex-col justify-center gap-2">
            <input type="submit" value="Зарегистрироваться" class="btn"/>
            <RouterLink to="/login" class="btn btn-ghost">Войти</RouterLink>
        </div>
    </form>
  </div>
</template>

<script lang="ts" setup>
import { RouterLink } from 'vue-router';


</script>