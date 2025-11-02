<template>
  <div :class="isCollapsed ? 'w-fit' : 'min-w-[20%] max-w-[20%]'" class="flex flex-col gap-4 bg-base-200 rounded-box pt-2">
    <ServiceLogo :collapsed="isCollapsed" />
    <div class="flex flex-col justify-between h-full w-full ">
      <ul class="menu w-full">
          <li>
            <router-link v-if="!isCollapsed" active-class="menu-active" to="recipe-book" class="flex items-center">
              <utensils :size="16" />Рецепты
            </router-link>
            <div active-class="menu-active" v-else class="tooltip tooltip-right h-[33px] w-fit flex items-center"  data-tip="Рецепты">
              <utensils :size="16" />
            </div>
          </li>

          <li v-show="false">
            <router-link v-if="!isCollapsed" to="families" class="flex items-center">
              <users :size="16" />Семьи
            </router-link>
            <div v-else class="tooltip tooltip-right h-[33px] w-fit flex items-center" data-tip="Семьи">
              <users :size="16" />
            </div>
          </li>

          <li v-show="false">
            <router-link v-if="!isCollapsed" to="menus" class="flex items-center">
              <hand-platter :size="16" />Меню
            </router-link>
            <div v-else class="tooltip tooltip-right h-[33px] w-fit flex items-center" data-tip="Меню">
              <hand-platter :size="16" />
            </div>
          </li>

      </ul>
      <ul class="menu w-full">
        <li>
          <a v-if="!isCollapsed" href="" class="flex items-center"><sun-moon :size="16" />Тема: ночная</a>
          <div v-else class="tooltip tooltip-right h-[33px] w-fit flex items-center" data-tip="Тема: ночная">
            <sun-moon :size="16" />
          </div>
        </li>

        <li>
          <router-link v-if="!isCollapsed" to="login" class="flex items-center">
            <log-out :size="16" />Выйти
          </router-link>
          <div v-else class="tooltip tooltip-right h-[33px] w-fit flex items-center" data-tip="Выйти">
            <router-link to="login" class="flex items-center">
              <log-out :size="16" />
            </router-link>
          </div>
        </li>

        <li @click="isCollapsed=!isCollapsed">
          <a v-if="!isCollapsed"  class="flex items-center">
            <chevrons-right-left :size="16" />Свернуть
          </a>
          <div v-else class="tooltip tooltip-right h-[33px] w-fit flex items-center" data-tip="Развернуть">
            <chevrons-left-right :size="16" />
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts" setup>
import ServiceLogo from './ServiceLogo.vue';
import { ChevronsRightLeft, ChevronsLeftRight, Users, Utensils, HandPlatter, SunMoon, LogOut } from 'lucide-vue-next';
import { ref } from 'vue';

const isCollapsed = ref(false)

</script>