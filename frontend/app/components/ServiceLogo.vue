<template>
  <div class="flex w-full hover:cursor-pointer justify-center items-center" @click="goToMain">
    <p class="font-bold text-lg hover:text-accent transition-colors">
      {{ props.collapsed ? 'P' : 'Pumsem'
      }}<span class="text-accent">{{ props.collapsed ? 'K' : 'Kitchen' }}</span>
    </p>
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
