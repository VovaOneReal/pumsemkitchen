<template>
  <div class="flex w-full gap-8">
    <MenuBar/>
    <div class="flex w-full">
        <router-view></router-view>
    </div>
  </div>
</template>

<script lang="ts" setup>
import MenuBar from '@/components/MenuBar.vue';


</script>