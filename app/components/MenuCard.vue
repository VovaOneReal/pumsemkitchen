<template>
  <div class="flex flex-col rounded-xl border border-default bg-default shadow-sm overflow-hidden">
    <!-- Заголовок с кнопками действий -->
    <div class="flex items-start justify-between p-4 pb-3 gap-4">
      <div class="flex flex-col gap-2 min-w-0">
        <!-- Название — переход к содержимому меню -->
        <NuxtLink :to="`/menu/${id}`" class="text-xl font-bold hover:text-primary transition-colors truncate block">
          {{ title }}
        </NuxtLink>
        <div class="flex flex-wrap gap-1.5">
          <UTooltip text="Автор меню">
            <UBadge variant="subtle" color="neutral" icon="i-lucide-user">{{ authorName }}</UBadge>
          </UTooltip>
          <UTooltip text="Дата создания">
            <UBadge variant="subtle" color="neutral" icon="i-lucide-calendar">{{ formatDate(createdAt) }}</UBadge>
          </UTooltip>
          <UTooltip v-if="editorName" text="Последний редактор">
            <UBadge variant="subtle" color="neutral" icon="i-lucide-user-pen">
              {{ editorName }}
            </UBadge>
          </UTooltip>
          <UTooltip v-if="editorName" text="Дата последнего изменения">
            <UBadge variant="subtle" color="neutral" icon="i-lucide-calendar-check">
              {{ formatDate(editedAt) }}
            </UBadge>
          </UTooltip>
        </div>
      </div>
      <div class="flex gap-1 shrink-0">
        <UTooltip text="Сформировать список покупок">
          <UButton
            icon="i-lucide-shopping-cart"
            variant="subtle"
            color="neutral"
            size="sm"
            :loading="shoppingListLoading"
            @click="$emit('create-shopping-list')"
          />
        </UTooltip>
        <UTooltip text="Редактировать меню">
          <UButton
            icon="i-lucide-pencil"
            variant="subtle"
            color="primary"
            size="sm"
            @click="$emit('edit')"
          />
        </UTooltip>
        <UTooltip text="Удалить меню">
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

    <!-- Период планирования -->
    <div class="px-4 py-3 border-t border-default">
      <UBadge v-if="dateFrom && dateTo" variant="subtle" color="neutral" icon="i-lucide-calendar-range">
        Запланировано на: {{ formatDate(dateFrom) }} — {{ formatDate(dateTo) }}
      </UBadge>
      <UBadge v-else variant="subtle" color="neutral" icon="i-lucide-calendar-x">
        В меню не добавлено ни одного дня
      </UBadge>
    </div>

    <!-- Collapsible: КБЖУ и стоимость меню -->
    <div class="border-t border-default">
      <button
        class="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-elevated transition-colors"
        @click="toggleNutrition"
      >
        <span>КБЖУ и стоимость</span>
        <UIcon
          :name="nutritionOpen ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
          class="text-muted w-4 h-4"
        />
      </button>
      <div v-if="nutritionOpen" class="px-4 pb-4 flex flex-col gap-1 text-sm">
        <template v-if="nutritionLoading">
          <USkeleton v-for="i in 5" :key="i" class="h-4 w-full rounded" />
        </template>
        <template v-else-if="nutrition">
          <p><span class="font-semibold">Стоимость:</span> {{ fmt2(nutrition.cost) }} ₽</p>
          <p><span class="font-semibold">Калории:</span> {{ fmt1(nutrition.calories) }} ккал</p>
          <p><span class="font-semibold">Белки:</span> {{ fmt1(nutrition.proteins) }} г</p>
          <p><span class="font-semibold">Жиры:</span> {{ fmt1(nutrition.fats) }} г</p>
          <p><span class="font-semibold">Углеводы:</span> {{ fmt1(nutrition.carbs) }} г</p>
        </template>
        <p v-else class="text-muted">Не удалось загрузить данные</p>
      </div>
    </div>
  </div>

  <!-- Диалог подтверждения удаления -->
  <UModal v-model:open="showDeleteModal">
    <template #content>
      <div class="p-6 flex flex-col gap-4">
        <h3 class="text-lg font-semibold">Подтвердите удаление</h3>
        <p class="text-sm text-muted">Вы действительно хотите удалить меню «{{ title }}»?</p>
        <div class="flex justify-end gap-2">
          <UButton variant="ghost" color="primary" label="Отменить" @click="showDeleteModal = false" />
          <UButton color="error" label="Удалить" @click="onConfirmDelete" />
        </div>
      </div>
    </template>
  </UModal>
</template>

<script lang="ts" setup>
import type { NutritionValues } from '~~/app/types'

const props = defineProps<{
  id: number
  title: string
  authorName: string
  createdAt: string
  editedAt: string
  editorName: string | null
  dateFrom: string | null
  dateTo: string | null
  shoppingListLoading?: boolean
}>()

const emit = defineEmits<{
  delete: []
  edit: []
  'create-shopping-list': []
}>()

const showDeleteModal = ref(false)
const nutritionOpen = ref(false)
const nutritionLoading = ref(false)
const nutrition = ref<NutritionValues | null>(null)

// Загружаем данные только при первом раскрытии
async function toggleNutrition() {
  nutritionOpen.value = !nutritionOpen.value
  if (nutritionOpen.value && nutrition.value === null && !nutritionLoading.value) {
    nutritionLoading.value = true
    try {
      nutrition.value = await $fetch<NutritionValues>(`/api/menus/${props.id}/nutrition`)
    } catch {
      nutrition.value = null
    } finally {
      nutritionLoading.value = false
    }
  }
}

const fmt1 = (v: number) => (Math.round(v * 10) / 10).toLocaleString('ru-RU')
const fmt2 = (v: number) => (Math.round(v * 100) / 100).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

// Форматирование даты ISO (YYYY-MM-DD) → DD.MM.YYYY
function formatDate(date: string | null): string {
  if (!date) return ''
  const [y, m, d] = date.split('-')
  return `${d}.${m}.${y}`
}

function onConfirmDelete() {
  showDeleteModal.value = false
  emit('delete')
}
</script>
