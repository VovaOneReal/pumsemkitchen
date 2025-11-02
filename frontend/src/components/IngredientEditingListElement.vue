<template>
  <div class="flex w-full gap-2 items-center max-w-none">
    <div
      class="flex flex-col gap-1 hover:bg-base-200 rounded-box hover:cursor-move transition-colors min-w-2 p-2 justify-center items-center"
    >
      <div class="w-1 h-1 rounded-full bg-accent"></div>
      <div class="w-1 h-3 rounded-full bg-accent"></div>
      <div class="w-1 h-1 rounded-full bg-accent"></div>
    </div>
    <input class="input w-full" type="text" placeholder="Название ингредиента..." v-model="name" />
    <div class="tooltip" data-tip="«По вкусу»">
      <input v-model="isOptional" class="checkbox" type="checkbox" name="" id="" />
    </div>
    <input
      :disabled="isOptional"
      class="input w-20"
      type="number"
      name=""
      id=""
      min="0"
      v-model="amount"
    />
    <select :disabled="isOptional" v-model="amountType" class="select w-24" name="" id="">
      <option value="table_spoon">ст. л.</option>
      <option value="tea_spoon">ч. л.</option>
      <option value="pcs">шт</option>
      <option value="g">гр</option>
      <option value="kg">кг</option>
      <option value="pcs">шт</option>
    </select>
    <button @click="$emit('delete', id)" class="btn btn-square btn-error"><X /></button>
  </div>
</template>

<script lang="ts" setup>
import { X } from 'lucide-vue-next'
import type { ModelRef } from 'vue'

const emit = defineEmits(['delete'])

const props = defineProps({
  id: Number,
})

const id = props.id

const name: ModelRef<string | undefined> = defineModel('name')
const isOptional: ModelRef<boolean | undefined> = defineModel('isOptional')
const amount: ModelRef<number | undefined> = defineModel('amount')
const amountType: ModelRef<string | undefined> = defineModel('amountType')
</script>
