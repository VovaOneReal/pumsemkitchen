<template>
  <div class="flex items-center justify-between p-4 rounded-xl border border-default bg-default shadow-sm">
    <!-- Дата — переход к содержимому дня -->
    <NuxtLink
      :to="`/menu/${menuId}/${date}`"
      class="text-xl font-bold hover:text-primary transition-colors"
    >
      {{ formattedDate }}
    </NuxtLink>
    <div class="flex gap-1">
      <UTooltip text="Изменить дату">
        <UButton
          icon="i-lucide-pen"
          variant="subtle"
          color="primary"
          size="sm"
          @click="openEditDate"
        />
      </UTooltip>
      <UTooltip text="Удалить день">
        <UButton
          icon="i-lucide-trash-2"
          variant="subtle"
          color="error"
          size="sm"
          @click="showDeleteModal = true"
        />
      </UTooltip>
    </div>
  </div>

  <!-- Диалог изменения даты -->
  <UModal v-model:open="showEditModal" :dismissible="false">
    <template #content>
      <div class="p-6 flex flex-col gap-5">
        <h3 class="text-lg font-semibold">Изменить дату дня</h3>
        <UFormField label="Новая дата" required>
          <UInput v-model="editDate" type="date" class="w-full" />
        </UFormField>
        <div class="flex justify-end gap-2">
          <UButton variant="ghost" color="error" label="Отменить" @click="showEditModal = false" />
          <UButton label="Сохранить" :disabled="!editDate" @click="onSaveDate" />
        </div>
      </div>
    </template>
  </UModal>

  <!-- Диалог подтверждения удаления дня -->
  <UModal v-model:open="showDeleteModal">
    <template #content>
      <div class="p-6 flex flex-col gap-4">
        <h3 class="text-lg font-semibold">Подтвердите удаление</h3>
        <p class="text-sm text-muted">Удалить день {{ formattedDate }} из меню?</p>
        <div class="flex justify-end gap-2">
          <UButton variant="ghost" color="primary" label="Отменить" @click="showDeleteModal = false" />
          <UButton color="error" label="Удалить" @click="onConfirmDelete" />
        </div>
      </div>
    </template>
  </UModal>
</template>

<script lang="ts" setup>
const props = defineProps<{
  date: string   // YYYY-MM-DD
  menuId: string
}>()

const emit = defineEmits<{
  delete: []
  'update-date': [newDate: string]
}>()

const showDeleteModal = ref(false)
const showEditModal = ref(false)
const editDate = ref(props.date)

// "24 марта"
const formattedDate = computed(() => {
  const [y, m, d] = props.date.split('-')
  const dateObj = new Date(Number(y), Number(m) - 1, Number(d))
  return dateObj.toLocaleString('ru-RU', { day: 'numeric', month: 'long' })
})

function openEditDate() {
  editDate.value = props.date
  showEditModal.value = true
}

function onSaveDate() {
  if (!editDate.value) return
  showEditModal.value = false
  emit('update-date', editDate.value)
}

function onConfirmDelete() {
  showDeleteModal.value = false
  emit('delete')
}
</script>
