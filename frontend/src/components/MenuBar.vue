<template>
  <div class="flex flex-col min-w-[20%] max-w-[20%] gap-4 bg-base-200 rounded-box pt-2">
    <ServiceLogo />
    <div class="flex flex-col justify-between h-full w-full ">
      <ul class="menu w-full">
          <li><router-link to="recipe-book" active-class="menu-active" class="flex items-center"><utensils :size="16" />Рецепты</router-link></li>
          <li><router-link to="families" class="flex items-center"><users :size="16" />Семьи</router-link></li>
          <li><router-link to="menus" class="flex items-center"><hand-platter :size="16" />Меню</router-link></li>
      </ul>
      <ul class="menu w-full">
        <li><a href="" class="flex items-center"><sun-moon :size="16" />Тема: ночная</a></li>
        <li><router-link to="login" class="flex items-center"><log-out :size="16" />Выйти</router-link></li>
        <li>
          <a class="flex items-center" href=""><chevrons-right-left :size="16" />Свернуть</a>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts" setup>
import ServiceLogo from './ServiceLogo.vue';
import { ChevronsRightLeft, Users, Utensils, HandPlatter, SunMoon, LogOut } from 'lucide-vue-next';


</script>