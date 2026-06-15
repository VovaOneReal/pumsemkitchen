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

        <!-- Модальное окно: Карточка продукта -->
        <UModal v-model:open="showProductModal" :ui="{ content: 'sm:max-w-3xl' }">
          <template #content>
            <div class="p-6 flex flex-col gap-5">
              <div class="flex items-center justify-between">
                <h3 class="text-xl font-semibold">Карточка продукта</h3>
                <UButton icon="i-lucide-x" variant="ghost" color="neutral" size="sm" @click="showProductModal = false" />
              </div>

              <div class="flex gap-6">
                <div class="flex flex-col gap-4 flex-1 min-w-0">
                  <div class="flex flex-col gap-2">
                    <p class="text-lg font-bold">{{ selectedViewProduct?.name }}</p>
                    <div class="flex items-center gap-2 flex-wrap">
                      <UTooltip text="Видимость продукта для других пользователей">
                        <UBadge
                          :label="(selectedViewProduct?.isPublic ?? true) ? 'Публичный' : 'Приватный'"
                          :icon="(selectedViewProduct?.isPublic ?? true) ? 'i-lucide-globe' : 'i-lucide-lock'"
                          variant="subtle"
                          :color="(selectedViewProduct?.isPublic ?? true) ? 'success' : 'neutral'"
                        />
                      </UTooltip>
                      <UTooltip text="Автор продукта">
                        <UBadge :label="selectedViewProduct?.authorName ?? '—'" icon="i-lucide-user" variant="subtle" color="neutral" />
                      </UTooltip>
                      <UTooltip text="Дата создания продукта">
                        <UBadge :label="selectedViewProduct?.createdAt ?? '—'" icon="i-lucide-calendar" variant="subtle" color="neutral" />
                      </UTooltip>
                      <UTooltip text="Автор последнего изменения">
                        <UBadge :label="selectedViewProduct?.modifierName ?? '—'" icon="i-lucide-user-pen" variant="subtle" color="neutral" />
                      </UTooltip>
                      <UTooltip text="Дата последнего изменения">
                        <UBadge :label="selectedViewProduct?.updatedAt ?? '—'" icon="i-lucide-calendar-check" variant="subtle" color="neutral" />
                      </UTooltip>
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-6">
                    <!-- Пищевая ценность -->
                    <div class="flex flex-col gap-2">
                      <p class="font-semibold text-sm">Пищевая ценность</p>
                      <p v-if="selectedViewProduct?.nutritionsFromProductName" class="text-xs text-primary">
                        Указаны значения из продукта {{ selectedViewProduct.nutritionsFromProductName }}
                      </p>
                      <p class="text-xs text-gray-500">на 100 г продукта</p>
                      <div class="flex flex-col gap-1 text-sm">
                        <div class="flex justify-between gap-4">
                          <span class="text-gray-700">Белки</span>
                          <span>{{ selectedViewProduct?.protein }} г</span>
                        </div>
                        <div class="flex justify-between gap-4">
                          <span class="text-gray-700">Жиры</span>
                          <span>{{ selectedViewProduct?.fat }} г</span>
                        </div>
                        <div class="flex justify-between gap-4">
                          <span class="text-gray-700">Углеводы</span>
                          <span>{{ selectedViewProduct?.carbs }} г</span>
                        </div>
                        <div class="flex justify-between gap-4">
                          <span class="text-gray-700">Калории</span>
                          <span>{{ calcCalories(selectedViewProduct?.protein ?? 0, selectedViewProduct?.fat ?? 0, selectedViewProduct?.carbs ?? 0) }} ккал</span>
                        </div>
                      </div>
                    </div>

                    <!-- Конвертация + Стоимость -->
                    <div class="flex flex-col gap-4">
                      <div class="flex flex-col gap-1">
                        <p class="font-semibold text-sm">Конвертация</p>
                        <p class="text-sm">{{ viewConversionText }}</p>
                      </div>
                      <div class="flex flex-col gap-1">
                        <p class="font-semibold text-sm">Стоимость</p>
                        <p v-if="selectedViewProduct?.priceFromProductName" class="text-xs text-primary">
                          Указана стоимость из публичного продукта {{ selectedViewProduct.priceFromProductName }}
                        </p>
                        <p class="text-sm">
                          {{ selectedViewProduct?.priceRub }} ₽
                          <span class="text-gray-500">&nbsp;за {{ selectedViewProduct?.priceQty }} {{ selectedViewProduct?.priceUnit }}.</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </UModal>

        <!-- Пищевая ценность -->
        <UCard v-if="nutritionPer100g">
          <template #header>
            <div class="flex flex-col items-center gap-1">
              <p class="font-bold text-lg">Пищевая ценность</p>
              <div class="flex items-center gap-1 text-sm text-muted">
                <span>на</span>
                <USelect
                  v-model="nutritionMode"
                  :items="nutritionModeItems"
                  value-key="value"
                  size="xs"
                  class="w-28"
                />
                <span>блюда</span>
              </div>
            </div>
          </template>
          <template #default>
            <div class="flex flex-col gap-1">
              <NutritionProgressBar type="proteins" label="Белки"    :value="displayedNutrition?.protein  ?? 0" />
              <NutritionProgressBar type="fats"     label="Жиры"     :value="displayedNutrition?.fat      ?? 0" />
              <NutritionProgressBar type="carbs"    label="Углеводы" :value="displayedNutrition?.carbs    ?? 0" />
              <NutritionProgressBar type="calories" label="Калорий"  :value="displayedNutrition?.calories ?? 0" />
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
              @name-click="openProductView(ing)"
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

// Просмотр карточки продукта из списка ингредиентов
const selectedViewProduct = ref<Product | null>(null)
const showProductModal = ref(false)

function openProductView(ing: { productId: number }) {
  const product = products.value.find(p => p.id === ing.productId)
  if (!product) return
  selectedViewProduct.value = product
  showProductModal.value = true
}

function calcCalories(protein: number, fat: number, carbs: number): number {
  return Math.round((4 * protein + 9 * fat + 4 * carbs) * 10) / 10
}

const viewConversionText = computed(() => {
  const p = selectedViewProduct.value
  if (!p || p.gMeasure == null) return 'Не указана'
  const parts = [`${p.gMeasure} г`]
  if (p.mlMeasure != null) parts.push(`${p.mlMeasure} мл`)
  if (p.pcsMeasure != null) parts.push(`${p.pcsMeasure} шт`)
  return parts.join(' = ')
})

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
    // Мл → граммы: mlMeasure мл = gMeasure г
    return (mlQty / product.mlMeasure) * product.gMeasure
  }

  if (unit.measure_type === 'piece') {
    // Штуки → граммы: pcsMeasure шт = gMeasure г
    if (!product.pcsMeasure || !product.gMeasure) return null
    return (qty / product.pcsMeasure) * product.gMeasure
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

// КБЖУ блюда на 100 г (опциональные и неконвертируемые ингредиенты исключаются)
const nutritionPer100g = computed(() => {
  if (!currentRecipe.value) return null

  let totalWeight = 0
  let totalProtein = 0
  let totalFat = 0
  let totalCarbs = 0

  for (const ing of currentRecipe.value.ingredients) {
    if (ing.isOptional) continue
    const product = products.value.find(p => p.id === ing.productId)
    if (!product) continue
    const grams = unitToGrams(ing.amount, ing.measurementUnitId, product)
    if (grams === null) continue

    totalWeight  += grams
    totalProtein += (grams * product.protein) / 100
    totalFat     += (grams * product.fat)     / 100
    totalCarbs   += (grams * product.carbs)   / 100
  }

  if (totalWeight === 0) return null

  const protein  = Math.round((totalProtein * 100) / totalWeight * 10) / 10
  const fat      = Math.round((totalFat     * 100) / totalWeight * 10) / 10
  const carbs    = Math.round((totalCarbs   * 100) / totalWeight * 10) / 10
  const calories = Math.round((protein * 4 + fat * 9 + carbs * 4) * 10) / 10

  return { protein, fat, carbs, calories, totalWeight }
})

// Режим отображения карточки пищевой ценности
const nutritionMode = ref<'100g' | 'serving'>('100g')

const nutritionModeItems = [
  { label: '100 г',    value: '100g'    },
  { label: '1 порцию', value: 'serving' },
]

// КБЖУ на 1 порцию: (КБЖУ_100г × вес_порции) / 100
const nutritionPerServing = computed(() => {
  const n = nutritionPer100g.value
  if (!n) return null
  const weightPerServing = n.totalWeight / basePortions.value
  const round = (v: number) => Math.round(v * 10) / 10
  return {
    protein:  round((n.protein  * weightPerServing) / 100),
    fat:      round((n.fat      * weightPerServing) / 100),
    carbs:    round((n.carbs    * weightPerServing) / 100),
    calories: round((n.calories * weightPerServing) / 100),
  }
})

// Значения для отображения в карточке в зависимости от выбранного режима
const displayedNutrition = computed(() =>
  nutritionMode.value === 'serving' ? nutritionPerServing.value : nutritionPer100g.value
)

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
