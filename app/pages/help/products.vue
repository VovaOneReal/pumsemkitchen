<template>
  <div class="flex gap-6 w-full py-4 px-6">
    <article class="flex-1 prose dark:prose-invert w-full overflow-y-auto">
      <ContentRenderer v-if="page" :value="page" />
    </article>
    <aside class="w-56 flex-shrink-0 py-1">
      <nav v-if="page?.body?.toc?.links?.length" class="flex flex-col gap-1 sticky top-4">
        <p class="px-2 pb-2 text-sm font-semibold text-highlighted">Содержание</p>
        <template v-for="link in page.body.toc.links" :key="link.id">
          <a
            :href="`#${link.id}`"
            class="text-sm text-muted hover:text-default px-2 py-0.5 rounded transition-colors"
            >{{ link.text }}</a
          >
          <template v-if="link.children">
            <a
              v-for="child in link.children"
              :key="child.id"
              :href="`#${child.id}`"
              class="text-sm text-muted hover:text-default px-4 py-0.5 rounded transition-colors"
              >{{ child.text }}</a
            >
          </template>
        </template>
      </nav>
    </aside>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'help' })

const { data: page } = await useAsyncData('help-products', () =>
  queryCollection('help').path('/help/products').first(),
)
</script>
