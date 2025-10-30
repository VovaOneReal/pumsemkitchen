<template>
  <div class="flex w-full hover:cursor-pointer justify-center items-center" @click="goToMain">
    <p class="font-bold text-lg hover:text-accent transition-colors">Pumsem<span class="text-accent">Kitchen</span></p>
  </div>
</template>

<script lang="ts" setup>
import router from '@/router';

function goToMain() {
    router.push("/")
}
</script>