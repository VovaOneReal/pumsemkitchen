<template>
  <div
    ref="el"
    class="flex flex-col gap-0.5 hover:bg-secondary rounded-md hover:cursor-move transition-colors min-w-2 p-2 justify-center items-center"
    @mousedown="onMouseDown"
  >
    <div class="w-2 h-px rounded-full bg-primary"></div>
    <div class="w-2 h-px rounded-full bg-primary"></div>
    <div class="w-2 h-px rounded-full bg-primary"></div>
  </div>
</template>

<script lang="ts" setup>
const el = ref<HTMLElement | null>(null)

function onMouseDown() {
  const row = el.value?.closest('[data-drag-row]') as HTMLElement | null
  if (!row) return

  row.draggable = true

  const cleanup = () => {
    row.draggable = false
    window.removeEventListener('mouseup', cleanup)
    window.removeEventListener('dragend', cleanup)
  }
  window.addEventListener('mouseup', cleanup)
  window.addEventListener('dragend', cleanup)
}
</script>
