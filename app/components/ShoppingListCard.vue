<template>
  <div class="flex flex-col gap-3 rounded-xl border border-default bg-default p-4 shadow-sm">
    <!-- Название и badges -->
    <div class="flex flex-col gap-2">
      <h3 class="text-xl font-bold">{{ title }}</h3>
      <div class="flex flex-wrap gap-1.5">
        <UBadge variant="subtle" color="neutral" :icon="'i-lucide-user'">
          {{ author }}
        </UBadge>
        <UBadge variant="subtle" color="neutral" :icon="'i-lucide-calendar'">
          {{ createdAt }}
        </UBadge>
        <UBadge variant="subtle" color="neutral" :icon="'i-lucide-user-pen'">
          {{ editor }}
        </UBadge>
        <UBadge variant="subtle" color="neutral" :icon="'i-lucide-calendar-check'">
          {{ editedAt }}
        </UBadge>
      </div>
    </div>

    <!-- Подвал с кнопками -->
    <div class="flex gap-2 items-center">
      <UButton
        leading-icon="i-lucide-external-link"
        label="Открыть"
        variant="subtle"
        class="flex-1 justify-center"
        @click="$emit('open')"
      />
      <UButton
        icon="i-lucide-trash-2"
        color="error"
        variant="subtle"
        @click="showDeleteModal = true"
      />
    </div>
  </div>

  <!-- Диалог подтверждения удаления -->
  <UModal v-model:open="showDeleteModal">
    <template #content>
      <div class="p-6 flex flex-col gap-4">
        <h3 class="text-lg font-semibold">Подтвердите удаление</h3>
        <p class="text-sm text-gray-600">Вы точно хотите удалить список {{ title }}?</p>
        <div class="flex justify-end gap-2">
          <UButton
            variant="ghost"
            color="primary"
            label="Отменить"
            @click="showDeleteModal = false"
          />
          <UButton color="error" label="Удалить" @click="onConfirmDelete" />
        </div>
      </div>
    </template>
  </UModal>
</template>

<script lang="ts" setup>
const props = defineProps<{
  title: string
  author: string
  createdAt: string
  editor: string
  editedAt: string
}>()

const emit = defineEmits<{
  delete: []
  open: []
}>()

const showDeleteModal = ref(false)

function onConfirmDelete() {
  showDeleteModal.value = false
  emit('delete')
}
</script>
