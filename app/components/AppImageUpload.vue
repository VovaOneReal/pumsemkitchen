<template>
  <div class="relative inline-block">
    <!-- Режим с изображением -->
    <template v-if="modelValue">
      <img
        ref="imgRef"
        :src="modelValue"
        class="rounded-lg cursor-zoom-in object-cover"
        v-bind="$attrs"
        @click="openViewer"
      />
      <UButton
        icon="i-lucide-trash"
        color="error"
        variant="soft"
        size="xs"
        class="absolute top-2 right-2"
        @click.stop="remove"
      />
    </template>

    <!-- Режим без изображения -->
    <label
      v-else
      class="flex flex-col gap-3 items-center justify-center rounded-lg border border-gray-200 bg-white cursor-pointer select-none"
      v-bind="$attrs"
    >
      <span class="text-sm text-gray-500 font-medium">Загрузите изображение</span>
      <UButton tag="span" variant="soft" color="primary" size="sm" icon="i-lucide-upload" />
      <input type="file" accept="image/*" class="hidden" @change="onFileChange" />
    </label>
  </div>
</template>

<script lang="ts" setup>
import Viewer from 'viewerjs'
import 'viewerjs/dist/viewer.css'

defineOptions({ inheritAttrs: false })

const modelValue = defineModel<string | null>({ default: null })

const imgRef = ref<HTMLImageElement | null>(null)
let viewer: Viewer | null = null

function onFileChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => {
    modelValue.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

function remove() {
  viewer?.destroy()
  viewer = null
  modelValue.value = null
}

function openViewer() {
  if (!imgRef.value) return
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
