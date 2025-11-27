<template>
  <div class="flex flex-col justify-between">
    <UNavigationMenu :collapsed="isCollapsed" :items="topItems" orientation="vertical">
      <template #logo>
        <ServiceLogo :collapsed="isCollapsed" />
      </template>
    </UNavigationMenu>
    <UNavigationMenu :collapsed="isCollapsed" :items="bottomItems" orientation="vertical">
      <template #menu-collapser>
        <MenuCollapser
          :collapsed="isCollapsed"
          @collapsed-change="isCollapsed = !isCollapsed"
        ></MenuCollapser>
      </template>
    </UNavigationMenu>
  </div>
</template>

<script lang="ts" setup>
import { Utensils, HandPlatter, SunMoon, LogOut, UserCircle } from 'lucide-vue-next'
import { ref } from 'vue'
import type { NavigationMenuItem } from '@nuxt/ui'

const isCollapsed = ref<boolean>(false)

const topItems = ref<NavigationMenuItem[]>([
  {
    to: '/',
    slot: 'logo' as const,
  },
  {
    label: 'Профиль',
    icon: UserCircle,
    to: '/profile',
    tooltip: true,
  },
  {
    label: 'Книга рецептов',
    icon: Utensils,
    to: '/recipebook',
    tooltip: true,
  },
  {
    label: 'Меню',
    icon: HandPlatter,
    disabled: true,
    tooltip: true,
  },
])

const bottomItems = ref<NavigationMenuItem[]>([
  {
    label: 'Сменить тему',
    icon: SunMoon,
    disabled: true,
    tooltip: true,
  },
  {
    label: 'Выйти',
    icon: LogOut,
    to: '/login',
    tooltip: true,
  },
  {
    label: 'Развернуть',
    slot: 'menu-collapser' as const,
    tooltip: true,
  },
])
</script>
