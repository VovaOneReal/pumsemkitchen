<template>
  <div class="flex w-full hover:cursor-pointer justify-center items-center" @click="goToMain">
    <h1 class="font-bold text-lg hover:text-accent transition-colors">
      {{ props.collapsed ? 'C' : 'Система '
      }}<span class="text-primary">{{ props.collapsed ? 'ПП' : 'Планирования Питания' }}</span>
    </h1>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps({
  collapsed: Boolean,
})

function goToMain() {
  navigateTo('/')
}
</script>
