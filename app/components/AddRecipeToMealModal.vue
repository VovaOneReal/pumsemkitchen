<template>
  <UModal :open="open" :dismissible="false" @update:open="$emit('update:open', $event)">
    <template #content>
      <div class="p-6 flex flex-col gap-5">
        <!-- Заголовок -->
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-bold">Добавить рецепт в «{{ mealTitle }}»</h2>
          <UButton
            icon="i-lucide-x"
            variant="ghost"
            color="neutral"
            square
            size="sm"
            @click="$emit('update:open', false)"
          />
        </div>

        <!-- Выбор рецепта -->
        <UFormField label="Рецепт" required>
          <UInputMenu
            v-model="selectedRecipeId"
            :items="recipeItems"
            value-key="value"
            placeholder="Выберите рецепт..."
            :loading="loadingRecipes"
            class="w-full"
          />
        </UFormField>

        <!-- Количество порций -->
        <UFormField label="Количество порций" required>
          <UInput
            v-model.number="portions"
            type="number"
            :min="1"
            :step="1"
            class="w-full"
          />
        </UFormField>

        <!-- Предпросмотр КБЖУ — появляется после выбора рецепта -->
        <div
          v-if="selectedRecipeId"
          class="flex flex-col gap-2 rounded-lg border border-default p-4 bg-elevated"
        >
          <p class="text-sm font-semibold text-muted">Будет добавлено к приёму пищи:</p>
          <div v-if="nutritionLoading" class="flex flex-col gap-2">
            <USkeleton v-for="i in 5" :key="i" class="h-4 w-full rounded" />
          </div>
          <div v-else-if="previewNutrition" class="flex flex-col gap-1 text-sm">
            <p><span class="font-semibold">Калории:</span> {{ fmt1(previewNutrition.calories) }} ккал</p>
            <p><span class="font-semibold">Белки:</span> {{ fmt1(previewNutrition.proteins) }} г</p>
            <p><span class="font-semibold">Жиры:</span> {{ fmt1(previewNutrition.fats) }} г</p>
            <p><span class="font-semibold">Углеводы:</span> {{ fmt1(previewNutrition.carbs) }} г</p>
            <p><span class="font-semibold">Стоимость:</span> {{ fmt2(previewNutrition.cost) }} ₽</p>
          </div>
        </div>

        <!-- Кнопки -->
        <div class="flex justify-end gap-2">
          <UButton
            variant="ghost"
            color="neutral"
            label="Отмена"
            @click="$emit('update:open', false)"
          />
          <UButton
            label="Добавить"
            :loading="saving"
            :disabled="!selectedRecipeId || portions < 1 || saving"
            @click="onConfirm"
          />
        </div>
      </div>
    </template>
  </UModal>
</template>

<script lang="ts" setup>
import type { NutritionValues } from '@/types'

const props = defineProps<{
  mealId: number
  mealTitle: string
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [boolean]
  'added': []
}>()

const toast = useToast()
const { recipes, loading: loadingRecipes, fetchRecipes } = useRecipes()

const selectedRecipeId = ref<number | null>(null)
const portions = ref(1)
const nutritionPerPortion = ref<NutritionValues | null>(null)
const nutritionLoading = ref(false)
const saving = ref(false)

const recipeItems = computed(() =>
  recipes.value.map((r) => ({ label: r.title, value: r.id })),
)

// КБЖУ для указанного числа порций
const previewNutrition = computed<NutritionValues | null>(() => {
  if (!nutritionPerPortion.value || portions.value < 1) return null
  const p = portions.value
  const n = nutritionPerPortion.value
  return {
    proteins: n.proteins * p,
    fats: n.fats * p,
    carbs: n.carbs * p,
    calories: n.calories * p,
    cost: n.cost * p,
  }
})

// Компонент монтируется свежим через v-if, поэтому onMounted подходит для загрузки рецептов
onMounted(fetchRecipes)

// При выборе рецепта загружаем его КБЖУ на 1 порцию
watch(selectedRecipeId, async (id) => {
  nutritionPerPortion.value = null
  if (!id) return
  nutritionLoading.value = true
  try {
    nutritionPerPortion.value = await $fetch<NutritionValues>(`/api/recipes/${id}/nutrition`)
  } finally {
    nutritionLoading.value = false
  }
})

async function onConfirm() {
  if (!selectedRecipeId.value || portions.value < 1) return
  saving.value = true
  try {
    await $fetch(`/api/meals/${props.mealId}/recipes`, {
      method: 'POST',
      body: { recipeId: selectedRecipeId.value, portions: portions.value },
    })
    emit('added')
    emit('update:open', false)
  } catch (err: any) {
    if (err?.statusCode === 409) {
      toast.add({ title: 'Рецепт уже добавлен в этот приём пищи', color: 'warning' })
    } else {
      toast.add({ title: 'Ошибка при добавлении рецепта', color: 'error' })
    }
  } finally {
    saving.value = false
  }
}

const fmt1 = (v: number) => (Math.round(v * 10) / 10).toLocaleString('ru-RU')
const fmt2 = (v: number) =>
  (Math.round(v * 100) / 100).toLocaleString('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
</script>
