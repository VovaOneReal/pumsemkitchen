<template>
  <UPageCard :to="`/recipes/recipe?id=${props.id}`" variant="soft">
    <template #body>
      <div class="w-full flex gap-4">
        <!-- <img class="h-[140px] w-[140px] object-cover rounded-lg flex-shrink-0" src="https://placehold.co/140x140" alt="" /> -->
        <div class="flex flex-col gap-1 min-w-0">
          <h3 class="ui-header-3 text-primary">{{ props.title }}</h3>
          <div class="flex items-center gap-3 text-sm text-muted">
            <span class="flex items-center gap-1">
              <UIcon name="i-lucide-user" class="w-4 h-4" />
              {{ props.authorName }}
            </span>
            <span class="flex items-center gap-1">
              <UIcon name="i-lucide-calendar" class="w-4 h-4" />
              {{ props.createdAt }}
            </span>
          </div>
          <p class="max-h-[80px] line-clamp-3 text-sm mt-1">{{ props.description }}</p>
        </div>
      </div>
    </template>
  </UPageCard>
</template>

<script lang="ts" setup>
import type { Recipe } from '@/types'

const props = defineProps<Recipe>()
</script>
