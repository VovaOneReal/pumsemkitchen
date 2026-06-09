<template>
  <div class="flex w-full gap-2 items-center">
    <!-- TODO: отображать необязательные элементы только при наведении курсора на весь компонент -->
    <DragElement />
    <UInput class="w-full" type="text" placeholder="Название ингредиента..." v-model="name" />
    <UTooltip text="«По вкусу»">
      <UCheckbox size="xl" v-model="isOptional" name="" id="" />
    </UTooltip>
    <UInputNumber
      :disabled="isOptional"
      orientation="vertical"
      class="w-24"
      name=""
      id=""
      :min="0"
      v-model="amount"
    />
    <USelect
      :disabled="isOptional"
      :items="amountTypeItems"
      v-model="amountType"
      class="select w-24"
      name=""
      id=""
    >
    </USelect>
    <UButton color="error" variant="ghost" square @click="$emit('delete', id)"><X /></UButton>
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
const isOptional: ModelRef<boolean | undefined> = defineModel('isOptional')
const amount: ModelRef<number | undefined> = defineModel('amount')
const amountType: ModelRef<string | undefined> = defineModel('amountType')
const amountTypeItems = ref<SelectItem[]>([
  {
    label: 'ст. л.',
    value: 'table_spoon',
  },
  {
    label: 'ч. л.',
    value: 'tea_spoon',
  },
  {
    label: 'шт',
    value: 'pcs',
  },
  {
    label: 'гр',
    value: 'g',
  },
  {
    label: 'кг',
    value: 'kg',
  },
])
</script>
