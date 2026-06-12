<template>
  <div class="flex gap-4 pl-3 pr-4 py-2 h-screen">
    <HelpMenu />
    <main class="flex w-full h-full overflow-y-auto">
      <slot />
    </main>
  </div>
</template>

<script lang="ts" setup></script>
