<template>
  <img
    ref="imgRef"
    :src="imageSrc"
    class="rounded-lg cursor-zoom-in object-cover"
    v-bind="$attrs"
    @click="openViewer"
  />
</template>

<script lang="ts" setup>
import Viewer from 'viewerjs'
import 'viewerjs/dist/viewer.css'

const props = defineProps<{
  src?: string
  placeholder?: boolean
  width?: number
  height?: number
}>()

const imageSrc = computed(() => {
  if (props.placeholder) {
    const w = props.width ?? 400
    const h = props.height ?? 300
    return `https://placehold.co/${w}x${h}`
  }
  return props.src ?? ''
})

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
