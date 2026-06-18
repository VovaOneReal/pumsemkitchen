<template>
  <div class="flex flex-col w-64 shrink-0 rounded-xl border border-default bg-default shadow-sm overflow-hidden">
    <!-- Шапка: название (ссылка на рецепт) + удалить -->
    <div class="flex items-center justify-between px-3 py-2 gap-2 border-b border-default">
      <NuxtLink
        :to="`/recipes/recipe?id=${recipeId}`"
        class="font-semibold text-sm truncate hover:text-primary transition-colors"
      >{{ title }}</NuxtLink>
      <UTooltip text="Удалить рецепт из приёма пищи">
        <UButton
          icon="i-lucide-trash-2"
          variant="subtle"
          color="error"
          size="xs"
          @click="showDeleteModal = true"
        />
      </UTooltip>
    </div>

    <!-- Подвал: количество порций + редактирование -->
    <div class="flex items-center justify-between px-3 py-2 border-t border-default text-sm">
      <span>Количество порций:</span>
      <div class="flex items-center gap-1">
        <span class="font-semibold">{{ portions }}</span>
        <UTooltip text="Изменить количество порций">
          <UButton
            icon="i-lucide-pencil"
            variant="subtle"
            color="primary"
            size="xs"
            @click="showEditPortionsModal = true"
          />
        </UTooltip>
      </div>
    </div>
  </div>

  <!-- Диалог подтверждения удаления -->
  <UModal v-model:open="showDeleteModal">
    <template #content>
      <div class="p-6 flex flex-col gap-4">
        <h3 class="text-lg font-semibold">Подтвердите удаление</h3>
        <p class="text-sm text-muted">Удалить рецепт «{{ title }}» из приёма пищи?</p>
        <div class="flex justify-end gap-2">
          <UButton variant="ghost" color="primary" label="Отменить" @click="showDeleteModal = false" />
          <UButton color="error" label="Удалить" @click="onConfirmDelete" />
        </div>
      </div>
    </template>
  </UModal>

  <!-- Диалог редактирования порций -->
  <UModal v-model:open="showEditPortionsModal">
    <template #content>
      <div class="p-6 flex flex-col gap-4">
        <h3 class="text-lg font-semibold">Количество порций</h3>
        <UInputNumber v-model="editPortions" :min="1" :step="1" class="w-full" />
        <div class="flex justify-end gap-2">
          <UButton variant="ghost" color="neutral" label="Отменить" @click="showEditPortionsModal = false" />
          <UButton label="Сохранить" @click="onSavePortions" />
        </div>
      </div>
    </template>
  </UModal>
</template>

<script lang="ts" setup>
const props = defineProps<{
  recipeId: number
  title: string
  imageUrl: string | null
  portions: number
}>()

const emit = defineEmits<{
  delete: []
  'update-portions': [portions: number]
}>()

const showDeleteModal = ref(false)
const showEditPortionsModal = ref(false)
const editPortions = ref(props.portions)

function onConfirmDelete() {
  showDeleteModal.value = false
  emit('delete')
}

function onSavePortions() {
  showEditPortionsModal.value = false
  emit('update-portions', editPortions.value)
}
</script>
