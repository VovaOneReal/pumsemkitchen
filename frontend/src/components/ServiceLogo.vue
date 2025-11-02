<template>
  <div class="flex w-full hover:cursor-pointer justify-center items-center" @click="goToMain">
    <p class="font-bold text-lg hover:text-accent transition-colors">
      {{ props.collapsed ? 'Ps' : 'Pumsem' }}<span class="text-accent">{{ props.collapsed ? 'K' : 'Kitchen'}}</span></p>
  </div>
</template>

<script lang="ts" setup>
import router from '@/router';

const props = defineProps({
  collapsed: Boolean
})

function goToMain() {
    router.push("/")
}
</script>