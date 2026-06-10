<template>
  <div class="flex w-full gap-2 items-center">
    <DragElement />
    <UInput class="flex-1" type="text" placeholder="Введите название ингредиента..." v-model="name" />
    <UInput class="w-32" type="text" placeholder="Примечание" v-model="note" />
    <UInputNumber
      :disabled="isOptional"
      orientation="horizontal"
      class="w-28"
      :min="0"
      v-model="amount"
    />
    <USelect
      :disabled="isOptional"
      :items="amountTypeItems"
      v-model="amountType"
      class="w-24"
    />
    <UCheckbox v-model="isOptional" label="По вкусу" />
    <UButton color="error" variant="ghost" square @click="$emit('delete', id)">
      <X />
    </UButton>
  </div>
</template>

<script lang="ts" setup>
import { X } from 'lucide-vue-next'
import type { SelectItem } from '@nuxt/ui'
import type { ModelRef } from 'vue'
import { ref } from 'vue'
import DragElement from './DragElement.vue'

const emit = defineEmits(['delete'])

const props = defineProps({
  id: Number,
})

const id = props.id

const name: ModelRef<string | undefined> = defineModel('name')
const note: ModelRef<string | undefined> = defineModel('note')
const isOptional: ModelRef<boolean | undefined> = defineModel('isOptional')
const amount: ModelRef<number | undefined> = defineModel('amount')
const amountType: ModelRef<string | undefined> = defineModel('amountType')

const amountTypeItems = ref<SelectItem[]>([
  { label: 'ст. л.', value: 'table_spoon' },
  { label: 'ч. л.', value: 'tea_spoon' },
  { label: 'шт', value: 'pcs' },
  { label: 'гр', value: 'g' },
  { label: 'кг', value: 'kg' },
  { label: 'мл', value: 'ml' },
  { label: 'л', value: 'l' },
])
</script>
