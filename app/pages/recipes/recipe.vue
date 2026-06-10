<template>
  <div class="flex flex-col gap-4 w-full h-full">
    <div v-if="isCurrentPage" class="flex gap-3 items-center">
      <UButton size="sm" variant="ghost" class="rounded-full" @click="router.back()">
        <template #leading>
          <ArrowLeft :size="20" />
        </template>
      </UButton>
      <h2>{{ mockRecipe.title }}</h2>
    </div>

    <div v-if="isCurrentPage" class="flex gap-6 w-full overflow-y-auto flex-1">
      <!-- Левая колонка (фиксированная ширина) -->
      <div class="flex flex-col gap-4 w-72 shrink-0">
        <AppImage placeholder :width="288" :height="200" class="w-full h-48" />

        <!-- Кнопки действий -->
        <div class="flex flex-col gap-2">
          <div class="flex gap-2">
            <UButton class="flex-1 justify-center" variant="outline" to="/recipes/recipe/edit">
              <template #leading><Pencil :size="16" /></template>
              Редактировать
            </UButton>
            <UPopover>
              <UButton variant="outline" color="error">
                <template #leading><Trash2 :size="16" /></template>
              </UButton>
              <template #content>
                <div class="flex flex-col gap-4 p-4">
                  <p class="text-lg font-bold text-center">Подтвердите удаление</p>
                  <div class="flex gap-4">
                    <UButton block color="error">Удалить</UButton>
                    <UButton block variant="soft">Отменить</UButton>
                  </div>
                </div>
              </template>
            </UPopover>
          </div>
          <div class="flex gap-2">
            <UTooltip text="Добавить в коллекцию">
              <UButton disabled variant="outline" class="flex-1 justify-center">
                <template #leading><FolderPlus :size="16" /></template>
              </UButton>
            </UTooltip>
            <UTooltip text="Настроить доступ">
              <UButton disabled variant="outline" class="flex-1 justify-center">
                <template #leading><Link2 :size="16" /></template>
              </UButton>
            </UTooltip>
            <UTooltip text="Добавить в меню питания">
              <UButton disabled variant="outline" class="flex-1 justify-center">
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
        <div class="flex flex-col gap-2">
          <h3>Описание</h3>
          <p>{{ mockRecipe.description }}</p>
        </div>

        <!-- Ингредиенты -->
        <div class="flex flex-col gap-3">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <h3>Ингредиенты</h3>
            <div class="flex items-center gap-4">
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
              <span class="text-sm">Стоимость: {{ totalCost }}₽</span>
            </div>
          </div>
          <div class="flex flex-col">
            <IngredientListElement
              v-for="(ing, i) in mockRecipe.ingredients"
              :key="i"
              :name="ing.name"
              :amount="ing.amount"
              :measure="ing.measure"
              :optional="ing.optional"
              :note="ing.note"
              :cost="Math.round(ing.baseCost * portions)"
            />
          </div>
        </div>

        <!-- Готовка -->
        <div class="flex flex-col gap-6">
          <h3>Готовка</h3>
          <RecipeStep
            v-for="(step, i) in mockRecipe.steps"
            :key="i"
            :step="step.step"
            :description="step.description"
            :image-src="step.imageSrc"
          />
        </div>
      </div>
    </div>

    <NuxtPage />
  </div>
</template>

<script lang="ts" setup>
import { ArrowLeft, Pencil, Trash2, FolderPlus, Link2, CalendarPlus, ListPlus, Minus, Plus } from 'lucide-vue-next'
import IngredientListElement from '@/components/IngredientListElement.vue'
import NutritionProgressBar from '@/components/NutritionProgressBar.vue'
import RecipeStep from '@/components/RecipeStep.vue'

const route = useRoute()
const router = useRouter()

const isCurrentPage = computed(() => route.path === '/recipes/recipe')

const portions = ref(4)

const mockRecipe = {
  title: 'Название рецепта',
  description:
    'Следует отметить, что существующая теория обеспечивает широкому кругу участие в формировании первоочередных требований. В своём стремлении повысить качество жизни, они забывают, что высокотехнологичная концепция общественного уклада обеспечивает актуальность кластеризации усилий. Разнообразный и богатый опыт говорит нам, что новая модель организационной деятельности напрямую зависит от системы обучения кадров.',
  ingredients: [
    { name: 'Название ингредиента', amount: 10, measure: 'гр', optional: false, note: 'Опциональное примечание', baseCost: 37.5 },
    { name: 'Название ингредиента', amount: 10, measure: 'гр', optional: false, note: 'Опциональное примечание', baseCost: 37.5 },
    { name: 'Название ингредиента', amount: 10, measure: 'гр', optional: false, note: 'Опциональное примечание', baseCost: 37.5 },
    { name: 'Название ингредиента', amount: 10, measure: 'гр', optional: true, note: 'Опциональное примечание', baseCost: 37.5 },
    { name: 'Название ингредиента', amount: 10, measure: 'гр', optional: false, note: null, baseCost: 37.5 },
    { name: 'Название ингредиента', amount: 10, measure: 'гр', optional: false, note: 'Опциональное примечание', baseCost: 37.5 },
  ],
  steps: [
    {
      step: 1,
      description:
        'Для современного мира курс на социально-ориентированный национальный проект предопределяет высокую востребованность вывода текущих активов. Картельные сговоры не допускают ситуации, при которой предприниматели в сети интернет представляют собой не что иное, как квинтэссенцию победы маркетинга над разумом.',
      imageSrc: 'https://placehold.co/250x150',
    },
    {
      step: 2,
      description:
        'Повседневная практика показывает, что экономическая повестка сегодняшнего дня прекрасно подходит для реализации системы массового участия.',
    },
    {
      step: 3,
      description:
        'Идейные соображения высшего порядка, а также постоянное информационно-пропагандистское обеспечение нашей деятельности позволяет выполнять важные задания по разработке модели развития.',
      imageSrc: 'https://placehold.co/250x150',
    },
  ],
}

const totalCost = computed(() =>
  Math.round(mockRecipe.ingredients.reduce((sum, ing) => sum + ing.baseCost, 0) * portions.value)
)
</script>
