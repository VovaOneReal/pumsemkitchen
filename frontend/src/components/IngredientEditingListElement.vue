<template>
  <div class="flex w-full gap-2 items-center max-w-none">
    <div class="flex flex-col gap-1 hover:bg-base-200 rounded-box hover:cursor-move transition-colors min-w-2 p-2 justify-center items-center">
        <div class="w-1 h-1 rounded-full bg-accent"></div>
        <div class="w-1 h-3 rounded-full bg-accent"></div>
        <div class="w-1 h-1 rounded-full bg-accent"></div>
    </div>
    <input class="input w-full" type="text" placeholder="Название ингредиента..."/>
    <div class="tooltip" data-tip="«По вкусу»">
        <input v-model="isOptional" class="checkbox" type="checkbox" name="" id=""/>
    </div>
    <input :disabled="isOptional" class="input w-20" type="number" name="" id="" min="0" value="1" />
    <select :disabled="isOptional" class="select w-24" name="" id="">
        <option value="table_spoon">ст. л.</option>
        <option value="tea_spoon">ч. л.</option>
        <option value="pcs">шт</option>
        <option value="g">гр</option>
        <option value="kg">кг</option>
        <option value="pcs">шт</option>
    </select>
    <button class="btn btn-square btn-error"><X/></button>
  </div>
</template>

<script lang="ts" setup>
import { X } from 'lucide-vue-next';
import { ref } from 'vue';

const isOptional = ref(false)
</script>