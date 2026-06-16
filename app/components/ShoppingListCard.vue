<template>
  <div class="flex flex-col gap-3 rounded-xl border border-default bg-default p-4 shadow-sm">
    <!-- Название и badges -->
    <div class="flex flex-col gap-2">
      <h3 class="text-xl font-bold">{{ title }}</h3>
      <div class="flex flex-wrap gap-1.5">
        <UTooltip text="Автор списка">
          <UBadge variant="subtle" color="neutral" :icon="'i-lucide-user'">
            {{ author }}
          </UBadge>
        </UTooltip>
        <UTooltip text="Дата создания">
          <UBadge variant="subtle" color="neutral" :icon="'i-lucide-calendar'">
            {{ createdAt }}
          </UBadge>
        </UTooltip>
        <template v-if="editor !== null">
          <UTooltip text="Последний редактор">
            <UBadge variant="subtle" color="neutral" :icon="'i-lucide-user-pen'">
              {{ editor }}
            </UBadge>
          </UTooltip>
          <UTooltip text="Дата последнего изменения">
            <UBadge variant="subtle" color="neutral" :icon="'i-lucide-calendar-check'">
              {{ editedAt }}
            </UBadge>
          </UTooltip>
        </template>
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
        icon="i-lucide-pencil"
        variant="subtle"
        @click="openEdit"
      />
      <UButton
        icon="i-lucide-trash-2"
        color="error"
        variant="subtle"
        @click="showDeleteModal = true"
      />
    </div>
  </div>

  <!-- Диалог редактирования -->
  <UModal v-model:open="showEditModal" :dismissible="false">
    <template #content>
      <UForm
        :schema="updateShoppingListSchema"
        :state="editFormState"
        class="p-6 flex flex-col gap-4"
        @submit="onConfirmEdit"
      >
        <h3 class="text-lg font-semibold">Переименовать список</h3>
        <UFormField name="title" label="Название" required>
          <UInput
            v-model="editFormState.title"
            placeholder="Название списка"
            class="w-full"
            autofocus
          />
        </UFormField>
        <div class="flex justify-end gap-2">
          <UButton
            type="button"
            variant="ghost"
            color="primary"
            label="Отменить"
            @click="showEditModal = false"
          />
          <UButton type="submit" label="Сохранить" :loading="editLoading" />
        </div>
      </UForm>
    </template>
  </UModal>

  <!-- Диалог подтверждения удаления -->
  <UModal v-model:open="showDeleteModal">
    <template #content>
      <div class="p-6 flex flex-col gap-4">
        <h3 class="text-lg font-semibold">Подтвердите удаление</h3>
        <p class="text-sm text-gray-600">Вы точно хотите удалить список «{{ title }}»?</p>
        <div class="flex justify-end gap-2">
          <UButton
            variant="ghost"
            color="primary"
            label="Отменить"
            @click="showDeleteModal = false"
          />
          <UButton
            color="error"
            label="Удалить"
            :loading="deleteLoading"
            @click="onConfirmDelete"
          />
        </div>
      </div>
    </template>
  </UModal>
</template>

<script lang="ts" setup>
import { updateShoppingListSchema } from '~~/schemas/shopping-list'

const props = defineProps<{
  id: number
  title: string
  author: string
  createdAt: string
  editor: string | null
  editedAt: string | null
  deleteLoading?: boolean
  editLoading?: boolean
}>()

const emit = defineEmits<{
  delete: []
  open: []
  edit: [newTitle: string]
}>()

const showDeleteModal = ref(false)
const showEditModal = ref(false)
const editFormState = ref({ title: '' })

function openEdit() {
  editFormState.value.title = props.title
  showEditModal.value = true
}

function onConfirmEdit() {
  emit('edit', editFormState.value.title)
  showEditModal.value = false
}

function onConfirmDelete() {
  showDeleteModal.value = false
  emit('delete')
}
</script>
