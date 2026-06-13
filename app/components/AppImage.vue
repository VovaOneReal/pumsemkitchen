<template>
  <!-- Состояние без изображения -->
  <div
    v-if="placeholder || !src"
    class="flex flex-col items-center justify-center gap-2 rounded-lg border border-gray-200 text-gray-400"
    v-bind="$attrs"
  >
    <ImageOff :size="40" :stroke-width="1.5" />
    <span class="text-sm">Нет изображения</span>
  </div>

  <!-- Состояние с изображением -->
  <img
    v-else
    ref="imgRef"
    :src="src"
    class="rounded-lg cursor-zoom-in object-cover"
    v-bind="$attrs"
    @click="openViewer"
  />
</template>

<script lang="ts" setup>
import Viewer from 'viewerjs'
import 'viewerjs/dist/viewer.css'
import { ImageOff } from 'lucide-vue-next'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  src?: string
  placeholder?: boolean
}>()

const imgRef = ref<HTMLImageElement | null>(null)
let viewer: Viewer | null = null

function openViewer() {
  if (!imgRef.value) return
  // Пересоздаём viewer при каждом открытии, чтобы src был актуальным
  viewer?.destroy()
  viewer = new Viewer(imgRef.value, {
    inline: false,
    navbar: false,
    toolbar: false,
    title: false,
    tooltip: false,
    movable: true,
    zoomable: true,
    rotatable: false,
    scalable: false,
    backdrop: true,
    button: true,
    keyboard: true,
  })
  viewer.show()
}

onBeforeUnmount(() => viewer?.destroy())
</script>
