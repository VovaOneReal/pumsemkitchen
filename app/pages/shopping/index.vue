<template>
  <div class="flex flex-col w-full px-2 gap-4">
    <!-- Заголовок и кнопка создания -->
    <div class="flex items-center justify-between w-full">
      <h2 class="ui-header-2">Списки покупок</h2>
      <UButton leading-icon="i-lucide-plus" label="Создать" @click="openCreate" />
    </div>

    <!-- Поиск -->
    <div>
      <UInput
        v-model="searchQuery"
        placeholder="Название..."
        class="w-64"
        :trailing-icon="'i-lucide-search'"
      />
    </div>

    <!-- Состояние загрузки -->
    <p v-if="loading" class="text-sm text-muted">Ищем ваши списки покупок, подождите...</p>

    <!-- Пустой список -->
    <p v-else-if="!filteredLists.length && !searchQuery" class="text-sm text-muted">
      У вас нет ни одного списка покупок. Его можно создать нажатием на кнопку «Создать».
    </p>

    <!-- Нет результатов поиска -->
    <p v-else-if="!filteredLists.length && searchQuery" class="text-sm text-muted">
      Ничего не найдено по запросу «{{ searchQuery }}».
    </p>

    <!-- Двухколончатая сетка карточек -->
    <div v-else class="grid grid-cols-2 gap-4">
      <ShoppingListCard
        v-for="list in filteredLists"
        :key="list.id"
        :id="list.id"
        :title="list.title"
        :author="list.authorName"
        :created-at="list.createdAt"
        :editor="list.editorName"
        :edited-at="list.editedAt"
        :delete-loading="deletingId === list.id"
        :edit-loading="editingId === list.id"
        @delete="onDelete(list.id)"
        @edit="(title) => onEdit(list.id, title)"
        @open="onOpen(list.id)"
      />
    </div>
  </div>

  <!-- Диалог создания списка -->
  <UModal v-model:open="showCreateModal" :dismissible="false">
    <template #content>
      <UForm
        :schema="createShoppingListSchema"
        :state="createFormState"
        class="p-6 flex flex-col gap-4"
        @submit="onCreateSubmit"
      >
        <h3 class="text-lg font-semibold">Новый список покупок</h3>
        <UFormField name="title" label="Название" required>
          <UInput
            v-model="createFormState.title"
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
            @click="showCreateModal = false"
          />
          <UButton type="submit" label="Создать" :loading="creating" />
        </div>
      </UForm>
    </template>
  </UModal>
</template>

<script lang="ts" setup>
import { createShoppingListSchema } from '~~/schemas/shopping-list'

useHead({ title: 'Списки покупок' })

const router = useRouter()
const toast = useToast()
const { lists, loading, creating, deletingId, editingId, fetchLists, createList, updateList, deleteList } = useShoppingLists()

const searchQuery = ref('')
const showCreateModal = ref(false)
const createFormState = ref({ title: '' })

onMounted(async () => {
  try {
    await fetchLists()
  } catch {
    toast.add({ title: 'Не удалось загрузить списки покупок', color: 'error' })
  }
})

const filteredLists = computed(() =>
  lists.value.filter((l) => l.title.toLowerCase().includes(searchQuery.value.toLowerCase())),
)

function openCreate() {
  createFormState.value.title = ''
  showCreateModal.value = true
}

async function onCreateSubmit() {
  try {
    await createList(createFormState.value.title)
    showCreateModal.value = false
    toast.add({ title: 'Список покупок создан', color: 'success' })
  } catch {
    toast.add({ title: 'Не удалось создать список покупок', color: 'error' })
  }
}

async function onDelete(id: number) {
  try {
    await deleteList(id)
    toast.add({ title: 'Список покупок удалён', color: 'success' })
  } catch {
    toast.add({ title: 'Не удалось удалить список покупок', color: 'error' })
  }
}

async function onEdit(id: number, title: string) {
  try {
    await updateList(id, title)
    toast.add({ title: 'Список покупок переименован', color: 'success' })
  } catch {
    toast.add({ title: 'Не удалось переименовать список покупок', color: 'error' })
  }
}

function onOpen(id: number) {
  router.push(`/shopping/${id}`)
}
</script>
