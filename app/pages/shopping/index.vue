<template>
  <div class="flex flex-col w-full px-2 gap-4">
    <!-- Заголовок и кнопка создания -->
    <div class="flex items-center justify-between w-full">
      <h2 class="ui-header-2">Списки покупок</h2>
      <UButton leading-icon="i-lucide-plus" label="Создать" />
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

    <!-- Двухколончатая сетка карточек -->
    <div class="grid grid-cols-2 gap-4">
      <ShoppingListCard
        v-for="list in filteredLists"
        :key="list.id"
        :title="list.title"
        :author="list.author"
        :created-at="list.createdAt"
        :editor="list.editor"
        :edited-at="list.editedAt"
        @delete="onDelete(list.id)"
        @open="onOpen(list.id)"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
useHead({ title: 'Списки покупок' })

const router = useRouter()
const searchQuery = ref('')

// Моканые данные для визуализации
const lists = ref([
  {
    id: 1,
    title: 'Название списка',
    author: 'Иван Иванов',
    createdAt: '01.06.2026',
    editor: 'Мария Сидорова',
    editedAt: '10.06.2026',
  },
  {
    id: 2,
    title: 'Название списка',
    author: 'Иван Иванов',
    createdAt: '02.06.2026',
    editor: 'Мария Сидорова',
    editedAt: '11.06.2026',
  },
  {
    id: 3,
    title: 'Название списка',
    author: 'Иван Иванов',
    createdAt: '03.06.2026',
    editor: 'Мария Сидорова',
    editedAt: '12.06.2026',
  },
  {
    id: 4,
    title: 'Название списка',
    author: 'Иван Иванов',
    createdAt: '04.06.2026',
    editor: 'Мария Сидорова',
    editedAt: '13.06.2026',
  },
])

const filteredLists = computed(() =>
  lists.value.filter((l) => l.title.toLowerCase().includes(searchQuery.value.toLowerCase())),
)

function onDelete(id: number) {
  // TODO: реализовать удаление
}

function onOpen(id: number) {
  router.push(`/shopping/${id}`)
}
</script>
