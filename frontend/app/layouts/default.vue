<template>
  <UContainer class="flex gap-8 py-2 h-screen">
    <MenuBar />
    <UMain class="flex w-full h-full overflow-y-scroll">
      <slot />
    </UMain>
  </UContainer>
</template>

<script lang="ts" setup></script>
