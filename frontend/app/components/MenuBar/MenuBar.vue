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
import { Utensils, List, Users, Folder, Package, SunMoon, LogOut } from 'lucide-vue-next'
import { ref } from 'vue'
import type { NavigationMenuItem } from '@nuxt/ui'

const isCollapsed = ref<boolean>(false)

const topItems = ref<NavigationMenuItem[]>([
  {
    to: '/',
    slot: 'logo' as const,
  },
  {
    label: 'Рецепты',
    icon: Utensils,
    to: '/recipebook',
    tooltip: true,
  },
  {
    label: 'Списки покупок',
    icon: List,
    to: '/shopping-lists',
    tooltip: true,
  },
  {
    label: 'Семьи',
    icon: Users,
    to: '/families',
    tooltip: true,
  },
  {
    label: 'Коллекции',
    icon: Folder,
    to: '/collections',
    tooltip: true,
  },
  {
    label: 'Продукты',
    icon: Package,
    to: '/products',
    tooltip: true,
  },
  {
    label: 'Меню',
    icon: Utensils,
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
