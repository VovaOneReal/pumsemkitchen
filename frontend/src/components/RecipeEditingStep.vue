<template>
  <div class="flex w-full gap-2 items-center max-w-none">
    <div class="flex flex-col gap-1 hover:bg-base-200 rounded-box hover:cursor-move transition-colors min-w-2 p-2 justify-center items-center">
        <div class="w-1 h-1 rounded-full bg-accent"></div>
        <div class="w-1 h-3 rounded-full bg-accent"></div>
        <div class="w-1 h-1 rounded-full bg-accent"></div>
    </div>
    <div class="flex items-baseline justify-center min-w-8 max-w-8 min-h-8 max-h-8 rounded-full border-2 font-bold ">{{ step }}</div>
    <textarea class="textarea w-full" placeholder="Что нужно делать?.."></textarea>
    <div class="tooltip" data-tip="Загрузить иллюстрацию"><button class="btn btn-square"><Upload/></button></div>
    <button class="btn btn-square btn-error"><X/></button>
  </div>
</template>

<script lang="ts" setup>
import { X, Upload } from 'lucide-vue-next';
const props = defineProps({
    step: Number,
})
</script>