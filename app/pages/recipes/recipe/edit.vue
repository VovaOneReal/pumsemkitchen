<template>
  <div class="flex flex-col gap-6 w-full h-full">
    <!-- Заголовок -->
    <div class="flex items-center gap-3 flex-shrink-0">
      <UButton
        icon="i-lucide-arrow-left"
        variant="ghost"
        square
        :to="editingId ? `/recipes/recipe?id=${editingId}` : '/recipes/recipe'"
      />
      <UButton color="primary" :loading="saving" @click="onSave">Сохранить</UButton>
      <h1 class="text-2xl font-bold">
        {{ isCreating && !editingId ? 'Создать рецепт' : 'Изменить рецепт' }}
      </h1>
    </div>

    <!-- Основной контент -->
    <div class="flex gap-6 w-full overflow-y-auto">
      <!-- Левая колонка: обложка и доп. поля -->
      <div class="flex flex-col gap-4 w-48 flex-shrink-0">
        <div class="flex flex-col gap-2">
          <h3 class="font-semibold">Обложка</h3>
          <AppImageUpload v-model="coverImage" class="w-full aspect-square" />
        </div>
        <UFormField label="Время готовки (мин.)" class="w-full">
          <UInputNumber v-model="cookingTime" :min="0" class="w-full" orientation="horizontal" />
        </UFormField>
      </div>

      <!-- Правая колонка: основные поля -->
      <div class="flex-1 flex flex-col gap-6 pb-4">
        <!-- Название -->
        <div class="flex flex-col gap-2">
          <h3 class="font-semibold">Название</h3>
          <UInput
            v-model="title"
            type="text"
            class="w-full"
            placeholder="Введите название рецепта..."
            :maxlength="128"
          />
        </div>

        <!-- Описание -->
        <div class="flex flex-col gap-2">
          <h3 class="font-semibold">Описание</h3>
          <UTextarea
            v-model="description"
            class="w-full"
            :rows="5"
            :maxrows="12"
            autoresize
            placeholder="Введите описание рецепта..."
          />
        </div>

        <!-- URL источника рецепта -->
        <div class="flex flex-col gap-2">
          <h3 class="font-semibold">Источник</h3>
          <UFormField :error="sourceUrlError">
            <UInput v-model="sourceUrl" type="url" class="w-full" placeholder="https://..." />
          </UFormField>
        </div>

        <!-- Ингредиенты -->
        <div class="flex flex-col gap-2">
          <div class="flex items-center justify-between">
            <h3 class="font-semibold">Ингредиенты</h3>
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-500">На количество порций</span>
              <UInputNumber v-model="portions" orientation="horizontal" :min="1" class="w-28" />
            </div>
          </div>
          <div class="flex flex-col w-full gap-1">
            <div
              v-for="(ingredient, index) in ingredients"
              :key="ingredient.id"
              data-drag-row
              :class="{ 'opacity-40': dragIngredientIndex === index }"
              @dragstart="onIngredientDragStart($event, index)"
              @dragover="onIngredientDragOver($event, index)"
              @drop.prevent
              @dragend="dragIngredientIndex = -1"
            >
              <IngredientEditingListElement
                :id="ingredient.id"
                v-model:product-id="ingredient.productId"
                v-model:note="ingredient.note"
                v-model:is-optional="ingredient.isOptional"
                v-model:amount="ingredient.amount"
                v-model:measurement-unit-id="ingredient.measurementUnitId"
                @delete="deleteIngredient"
              />
            </div>
          </div>
          <UButton block variant="soft" icon="i-lucide-plus" @click="addIngredient">
            Добавить ингредиент
          </UButton>
        </div>

        <!-- Готовка -->
        <div class="flex flex-col gap-2">
          <h3 class="font-semibold">Приготовление</h3>
          <div class="flex flex-col w-full gap-1">
            <div
              v-for="(step, index) in recipeSteps"
              :key="step.step"
              data-drag-row
              :class="{ 'opacity-40': dragStepIndex === index }"
              @dragstart="onStepDragStart($event, index)"
              @dragover="onStepDragOver($event, index)"
              @drop.prevent
              @dragend="onStepDragEnd"
            >
              <RecipeEditingStep
                :step="step.step"
                v-model:description="step.description"
                v-model:image-src="step.pictureUrl"
                @delete="deleteRecipeStep"
              />
            </div>
          </div>
          <UButton
            block
            variant="soft"
            icon="i-lucide-plus"
            @click="
              recipeSteps.push({ step: recipeSteps.length, description: '', pictureUrl: null })
            "
          >
            Добавить шаг
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import IngredientEditingListElement from '@/components/IngredientEditingListElement.vue'
import RecipeEditingStep from '@/components/RecipeEditingStep.vue'
import { reactive, ref } from 'vue'
import type { RecipeStep } from '@/types'
import { createRecipeSchema, updateRecipeSchema } from '~~/schemas/recipe'

interface IngredientFormItem {
  id: number
  productId: number | null
  note: string
  isOptional: boolean
  amount: number
  measurementUnitId: number | null
}

const { createRecipe, updateRecipe, currentRecipe, fetchRecipeById } = useRecipes()
const { isCreating } = useRecipeState()
const toast = useToast()
const route = useRoute()

const editingId = computed(() => (route.query.id ? Number(route.query.id) : null))

const title = ref('')
const description = ref('')
const coverImage = ref<string | null>(null)
const sourceUrl = ref<string | null>(null)
const sourceUrlError = computed(() => {
  if (!sourceUrl.value) return undefined
  try {
    new URL(sourceUrl.value)
    return undefined
  } catch {
    return 'Введите корректный URL'
  }
})
const portions = ref(4)
const cookingTime = ref(0)
const saving = ref(false)

let nextIngredientId = 0
const ingredients: IngredientFormItem[] = reactive([])
const recipeSteps: RecipeStep[] = reactive([])

onMounted(async () => {
  if (!editingId.value) return

  if (!currentRecipe.value || currentRecipe.value.id !== editingId.value) {
    await fetchRecipeById(editingId.value)
  }

  const r = currentRecipe.value
  if (!r) return

  title.value = r.title
  description.value = r.description ?? ''
  cookingTime.value = r.cookingTimeMin ?? 0
  portions.value = r.portions ?? 4
  coverImage.value = r.pictureUrl
  sourceUrl.value = r.sourceUrl ?? null

  ingredients.push(
    ...r.ingredients.map((ing, i) => ({
      id: i + 1,
      productId: ing.productId,
      note: ing.note ?? '',
      isOptional: ing.isOptional,
      amount: ing.amount,
      measurementUnitId: ing.measurementUnitId,
    })),
  )
  nextIngredientId = r.ingredients.length

  recipeSteps.push(
    ...r.steps.map((s) => ({
      step: s.step - 1,
      description: s.description,
      pictureUrl: s.pictureUrl,
    })),
  )
})

function addIngredient() {
  ingredients.push({
    id: ++nextIngredientId,
    productId: null,
    note: '',
    isOptional: false,
    amount: 4,
    measurementUnitId: null,
  } as IngredientFormItem)
}

function deleteIngredient(id: number) {
  const idx = ingredients.findIndex((i) => i.id === id)
  if (idx !== -1) ingredients.splice(idx, 1)
}

function deleteRecipeStep(step: number) {
  recipeSteps.splice(step, 1)
  for (let i = step; i < recipeSteps.length; i++) {
    recipeSteps[i].step -= 1
  }
}

async function onSave() {
  const body = {
    title: title.value,
    description: description.value || null,
    cooking_time_min: cookingTime.value > 0 ? cookingTime.value : null,
    portions: portions.value,
    is_public: false,
    picture_url: coverImage.value,
    source_url: sourceUrl.value || null,
    ingredients: ingredients.map((ing) => ({
      product_id: ing.productId!,
      measurement_unit_id: ing.measurementUnitId!,
      quantity: ing.amount,
      is_optional: ing.isOptional,
      note: ing.note || undefined,
    })),
    steps: recipeSteps.map((s) => ({
      order: s.step + 1, // API требует positive (> 0), step 0-indexed
      description: s.description,
      picture_url: s.pictureUrl ?? null,
    })),
  }

  const schema = editingId.value ? updateRecipeSchema : createRecipeSchema
  const result = schema.safeParse(body)
  if (!result.success) {
    toast.add({ title: 'Ошибка', description: result.error.issues[0]?.message, color: 'error' })
    return
  }

  saving.value = true
  try {
    if (editingId.value) {
      await updateRecipe(editingId.value, result.data)
      await navigateTo(`/recipes/recipe?id=${editingId.value}`)
    } else {
      await createRecipe(result.data)
      await navigateTo('/recipes')
    }
  } catch {
    const action = editingId.value ? 'обновить' : 'создать'
    toast.add({
      title: 'Ошибка сохранения',
      description: `Не удалось ${action} рецепт`,
      color: 'error',
    })
  } finally {
    saving.value = false
  }
}

// --- Drag & Drop: ингредиенты ---
let dragIngredientIndex = ref(-1)

function onIngredientDragStart(e: DragEvent, index: number) {
  dragIngredientIndex.value = index
  if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move'
}

function onIngredientDragOver(e: DragEvent, index: number) {
  e.preventDefault()
  if (dragIngredientIndex.value === -1 || dragIngredientIndex.value === index) return
  const [item] = ingredients.splice(dragIngredientIndex.value, 1)
  ingredients.splice(index, 0, item)
  dragIngredientIndex.value = index
}

// --- Drag & Drop: шаги ---
let dragStepIndex = ref(-1)

function onStepDragStart(e: DragEvent, index: number) {
  dragStepIndex.value = index
  if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move'
}

function onStepDragOver(e: DragEvent, index: number) {
  e.preventDefault()
  if (dragStepIndex.value === -1 || dragStepIndex.value === index) return
  const [item] = recipeSteps.splice(dragStepIndex.value, 1)
  recipeSteps.splice(index, 0, item)
  dragStepIndex.value = index
}

function onStepDragEnd() {
  // Пересчитываем порядковые номера шагов после перетаскивания
  recipeSteps.forEach((s, i) => {
    s.step = i
  })
  dragStepIndex.value = -1
}
</script>
