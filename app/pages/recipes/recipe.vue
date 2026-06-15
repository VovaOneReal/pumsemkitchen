<template>
  <div class="flex flex-col gap-4 w-full h-full">
    <div v-if="isCurrentPage" class="flex gap-3 items-center">
      <UButton size="sm" variant="ghost" class="rounded-full" @click="router.push('/recipes')">
        <template #leading>
          <ArrowLeft :size="20" />
        </template>
      </UButton>
      <h2>{{ currentRecipe?.title ?? '...' }}</h2>
    </div>

    <div v-if="isCurrentPage && detailLoading" class="flex items-center justify-center flex-1">
      <UIcon name="i-lucide-loader-circle" class="animate-spin w-8 h-8 text-muted" />
    </div>

    <div v-if="isCurrentPage && !detailLoading && currentRecipe" class="flex gap-6 w-full overflow-y-auto flex-1">
      <!-- Левая колонка (фиксированная ширина) -->
      <div class="flex flex-col gap-4 w-72 shrink-0">
        <AppImage
          :src="currentRecipe.pictureUrl ?? undefined"
          :placeholder="!currentRecipe.pictureUrl"
          :width="288"
          :height="200"
          class="w-full h-48"
        />

        <!-- Кнопки действий -->
        <div class="flex flex-col gap-2">
          <div class="flex gap-2">
            <UButton class="flex-1 justify-center" variant="outline" :to="`/recipes/recipe/edit?id=${currentRecipe.id}`">
              <template #leading><Pencil :size="16" /></template>
              Редактировать
            </UButton>
            <UPopover v-model:open="deletePopoverOpen">
              <UButton variant="outline" color="error">
                <template #leading><Trash2 :size="16" /></template>
              </UButton>
              <template #content>
                <div class="flex flex-col gap-4 p-4">
                  <p class="text-lg font-bold text-center">Подтвердите удаление</p>
                  <div class="flex gap-4">
                    <UButton block color="error" :loading="deleting" @click="onDelete">Удалить</UButton>
                    <UButton block variant="soft" @click="deletePopoverOpen = false">Отменить</UButton>
                  </div>
                </div>
              </template>
            </UPopover>
          </div>
          <div class="flex gap-2">
            <UTooltip text="Добавить в меню питания">
              <UButton variant="outline" class="flex-1 justify-center" @click="addToMenuOpen = true">
                <template #leading><CalendarPlus :size="16" /></template>
              </UButton>
            </UTooltip>
            <UTooltip text="Сформировать список покупок">
              <UButton disabled variant="outline" class="flex-1 justify-center">
                <template #leading><ListPlus :size="16" /></template>
              </UButton>
            </UTooltip>
          </div>
        </div>

        <!-- Модальное окно: Добавление в меню -->
        <UModal v-model:open="addToMenuOpen">
          <template #content>
            <div class="p-6 flex flex-col gap-6">
              <div class="flex items-center justify-between">
                <h2 class="text-xl font-bold">Добавление в меню</h2>
                <UButton icon="i-lucide-x" variant="ghost" square size="sm" @click="addToMenuOpen = false" />
              </div>
              <div class="flex flex-col gap-4">
                <UFormField label="Выберите меню" required>
                  <USelect
                    v-model="selectedMenu"
                    :items="mockMenus"
                    placeholder="Выберите меню..."
                    class="w-full"
                  />
                </UFormField>
                <UFormField v-if="selectedMenu" label="Выберите день меню" required>
                  <USelect
                    v-model="selectedDay"
                    :items="mockDays"
                    placeholder="Выберите день..."
                    class="w-full"
                  />
                </UFormField>
                <UFormField v-if="selectedDay" label="Выберите приём пищи" required>
                  <USelect
                    v-model="selectedMeal"
                    :items="mockMeals"
                    placeholder="Выберите приём пищи..."
                    class="w-full"
                  />
                </UFormField>
                <UFormField v-if="selectedMeal" label="Укажите число порций" required>
                  <UInputNumber v-model="addPortions" :min="1" orientation="horizontal" class="w-full" />
                </UFormField>
              </div>
              <div class="flex justify-end">
                <UButton color="primary" :disabled="!selectedMeal">Добавить</UButton>
              </div>
            </div>
          </template>
        </UModal>

        <!-- Пищевая ценность -->
        <UCard>
          <template #header>
            <div class="flex flex-col items-center gap-1">
              <p class="font-bold text-lg">Пищевая ценность</p>
              <p class="text-sm text-muted">на 100 гр. сырых продуктов</p>
            </div>
          </template>
          <template #default>
            <div class="flex flex-col gap-1">
              <NutritionProgressBar type="proteins" label="Белки" :value="1.4" />
              <NutritionProgressBar type="fats" label="Жиры" :value="1.4" />
              <NutritionProgressBar type="carbs" label="Углеводы" :value="1.4" />
              <NutritionProgressBar type="calories" label="Калорий" :value="1024" />
            </div>
          </template>
        </UCard>
      </div>

      <!-- Правая колонка (растянутая) -->
      <div class="flex flex-col gap-6 flex-1 min-w-0">
        <!-- Описание -->
        <div v-if="currentRecipe.description" class="flex flex-col gap-2">
          <h3>Описание</h3>
          <p>{{ currentRecipe.description }}</p>
        </div>

        <!-- Источник -->
        <div v-if="currentRecipe.sourceUrl" class="flex items-center gap-2 min-w-0">
          <span class="text-sm text-muted shrink-0">Источник:</span>
          <a
            :href="currentRecipe.sourceUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="text-sm text-primary truncate hover:underline"
          >{{ currentRecipe.sourceUrl }}</a>
        </div>

        <!-- Ингредиенты -->
        <div v-if="currentRecipe.ingredients.length" class="flex flex-col gap-3">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <h3>Ингредиенты</h3>
            <div class="flex items-center gap-3 flex-wrap">
              <div class="flex items-center gap-2">
                <span class="text-sm">Порции:</span>
                <div class="flex items-center gap-1">
                  <UButton size="xs" variant="ghost" :disabled="portions <= 1" @click="portions--">
                    <template #leading><Minus :size="14" /></template>
                  </UButton>
                  <span class="text-sm min-w-6 text-center">{{ portions }}</span>
                  <UButton size="xs" variant="ghost" @click="portions++">
                    <template #leading><Plus :size="14" /></template>
                  </UButton>
                </div>
              </div>
              <span v-if="totalCost !== undefined" class="text-sm text-muted">
                ~{{ totalCost.toLocaleString('ru-RU') }} ₽
              </span>
            </div>
          </div>
          <div class="flex flex-col">
            <IngredientListElement
              v-for="ing in currentRecipe.ingredients"
              :key="ing.id"
              :name="ing.name"
              :amount="scaledAmount(ing.amount)"
              :measure="ing.amountType"
              :optional="ing.isOptional"
              :note="ing.note ?? undefined"
              :cost="ingredientCosts.get(ing.id)"
            />
          </div>
        </div>

        <!-- Готовка -->
        <div v-if="currentRecipe.steps.length" class="flex flex-col gap-6">
          <div class="flex items-center justify-between">
            <h3>Готовка</h3>
            <div v-if="currentRecipe.cookingTimeMin" class="flex items-center gap-1 text-sm text-muted">
              <Clock :size="16" />
              <span>Время готовки (мин.): {{ currentRecipe.cookingTimeMin }}</span>
            </div>
          </div>
          <RecipeStep
            v-for="step in currentRecipe.steps"
            :key="step.step"
            :step="step.step"
            :description="step.description"
            :image-src="step.pictureUrl ?? undefined"
          />
        </div>
      </div>
    </div>

    <NuxtPage />
  </div>
</template>

<script lang="ts" setup>
import { ArrowLeft, Pencil, Trash2, CalendarPlus, ListPlus, Minus, Plus, Clock } from 'lucide-vue-next'
import type { Product } from '~/types'
import IngredientListElement from '@/components/IngredientListElement.vue'
import NutritionProgressBar from '@/components/NutritionProgressBar.vue'
import RecipeStep from '@/components/RecipeStep.vue'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const { currentRecipe, detailLoading, fetchRecipeById, deleteRecipe } = useRecipes()
const { products, fetchProducts } = useProducts()
const { measurements, fetchMeasurements } = useMeasurements()
const { converts, fetchConverts } = useConverts()

const deleting = ref(false)
const deletePopoverOpen = ref(false)

// Модалка: Добавление в меню
const addToMenuOpen = ref(false)
const selectedMenu = ref<string | null>(null)
const selectedDay = ref<string | null>(null)
const selectedMeal = ref<string | null>(null)
const addPortions = ref(1)

const mockMenus = ['Меню на неделю', 'Праздничное меню', 'Диетическое меню']
const mockDays = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье']
const mockMeals = ['Завтрак', 'Обед', 'Ужин', 'Перекус']

watch(selectedMenu, () => { selectedDay.value = null; selectedMeal.value = null })
watch(selectedDay, () => { selectedMeal.value = null })

async function onDelete() {
  if (!currentRecipe.value) return
  deleting.value = true
  try {
    await deleteRecipe(currentRecipe.value.id)
    await navigateTo('/recipes')
  } catch {
    toast.add({ title: 'Ошибка', description: 'Не удалось удалить рецепт', color: 'error' })
  } finally {
    deleting.value = false
  }
}

const isCurrentPage = computed(() => route.path === '/recipes/recipe')

const portions = ref(4)

const basePortions = computed(() => currentRecipe.value?.portions ?? 1)

function scaledAmount(baseAmount: number): number {
  return Math.round(baseAmount * (portions.value / basePortions.value) * 10) / 10
}

// Конвертирует qty в единице unitId в граммы для конкретного продукта.
// Возвращает null, если конвертация невозможна (нет коэффициента или нужных полей продукта).
function unitToGrams(qty: number, unitId: number, product: Product): number | null {
  const unit = measurements.value.find(u => u.measurement_unit_id === unitId)
  if (!unit) return null

  if (unit.measure_type === 'weight') {
    // Уже граммы — конвертация не нужна
    if (unit.is_standart) return qty
    // Конвертация в граммы через таблицу converts
    const stdGram = measurements.value.find(u => u.measure_type === 'weight' && u.is_standart)
    const conv = converts.value.find(c => c.fromUnitId === unitId && c.toUnitId === stdGram?.measurement_unit_id)
    return conv ? qty * conv.coefficient : null
  }

  if (unit.measure_type === 'volume' || unit.measure_type === 'volume_extra') {
    if (!product.mlMeasure || !product.gMeasure) return null
    // Стандартная единица объёма — мл (volume + is_standart)
    const stdMl = measurements.value.find(u => u.measure_type === 'volume' && u.is_standart)
    let mlQty = qty
    // Если не мл (литры, ложки, стаканы) — сначала приводим к мл через converts
    if (unitId !== stdMl?.measurement_unit_id) {
      const conv = converts.value.find(c => c.fromUnitId === unitId && c.toUnitId === stdMl?.measurement_unit_id)
      if (!conv) return null
      mlQty = qty * conv.coefficient
    }
    // Мл → граммы с учётом плотности продукта
    return mlQty * (product.mlMeasure / product.gMeasure)
  }

  if (unit.measure_type === 'piece') {
    // Штуки → граммы: pcs_measure и g_measure должны быть заполнены одновременно
    if (!product.pcsMeasure || !product.gMeasure) return null
    return qty * (product.pcsMeasure / product.gMeasure)
  }

  // 'extra' — конвертация невозможна
  return null
}

// Реактивный кэш стоимостей по id ингредиента.
// Пересчитывается при изменении portions, converts, measurements или списка продуктов.
const ingredientCosts = computed<Map<number, number | undefined>>(() => {
  const map = new Map<number, number | undefined>()
  if (!currentRecipe.value) return map

  for (const ing of currentRecipe.value.ingredients) {
    if (ing.isOptional) { map.set(ing.id, undefined); continue }

    const product = products.value.find(p => p.id === ing.productId)
    if (!product || !product.priceQty || !product.measurementUnitId) {
      map.set(ing.id, undefined); continue
    }

    // Количество ингредиента (с учётом масштаба порций) → граммы
    const ingGrams = unitToGrams(scaledAmount(ing.amount), ing.measurementUnitId, product)
    // Количество продукта за указанную цену → граммы
    const priceGrams = unitToGrams(product.priceQty, product.measurementUnitId, product)

    if (ingGrams === null || !priceGrams) { map.set(ing.id, undefined); continue }

    map.set(ing.id, Math.round(ingGrams * (product.priceRub / priceGrams) * 100) / 100)
  }
  return map
})

const totalCost = computed(() => {
  if (!currentRecipe.value) return undefined
  const costs = [...ingredientCosts.value.values()]
  if (costs.every(c => c === undefined)) return undefined
  return Math.round(costs.reduce((sum, c) => sum + (c ?? 0), 0) * 100) / 100
})

watch(
  () => route.query.id,
  (id) => {
    if (id) {
      fetchRecipeById(Number(id)).then(() => {
        portions.value = currentRecipe.value?.portions ?? 4
      })
    }
  },
  { immediate: true },
)

onMounted(() => {
  fetchProducts()
  fetchMeasurements()
  fetchConverts()
})
</script>
