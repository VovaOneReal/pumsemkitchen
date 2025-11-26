<template>
  <div
    class="flex gap-2 items-center cursor-pointer"
    :icon="collapsed ? ChevronsRightLeft : ChevronsLeftRight"
    size="md"
    @click="
      () => {
        $emit('collapsedChange')
      }
    "
  >
    <ChevronsLeftRight :size="20" v-if="collapsed"></ChevronsLeftRight>
    <ChevronsLeftRight :size="20" v-else></ChevronsLeftRight>
    {{ collapsed ? '' : 'Свернуть' }}
  </div>
</template>

<script lang="ts" setup>
import { ChevronsRightLeft, ChevronsLeftRight } from 'lucide-vue-next'

const emit = defineEmits(['collapsedChange'])

const props = defineProps({
  collapsed: Boolean,
})
</script>
