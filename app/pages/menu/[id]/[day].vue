<template>
  <div class="flex flex-col w-full px-2 gap-4">
    <!-- Заголовок -->
    <div class="flex items-center gap-2 min-w-0">
      <UButton icon="i-lucide-arrow-left" variant="ghost" color="neutral" :to="`/menu/${menuId}`" />
      <h2 class="ui-header-2 truncate">{{ dayDetail?.menuTitle ?? '...' }} / {{ formattedDay }}</h2>
    </div>

    <!-- Подзаголовок -->
    <h3 class="text-2xl font-bold">Приёмы пищи</h3>

    <!-- Индикатор загрузки -->
    <div v-if="loading" class="flex flex-col gap-4">
      <USkeleton v-for="i in 5" :key="i" class="h-32 w-full rounded-xl" />
    </div>

    <!-- Карточки приёмов пищи и итог дня -->
    <div v-else class="flex flex-col gap-4">
      <MealCard
        v-for="(meal, idx) in dayDetail?.meals ?? []"
        :key="meal.mealId"
        :name="meal.mealTitle"
        :recipes="meal.recipes.map((r) => ({ id: r.recipeId, title: r.title, imageUrl: r.pictureUrl, portions: r.portions }))"
        :nutrition="mealsNutrition[idx]"
        @delete-recipe="(recipeId) => onDeleteRecipe(meal.mealId, recipeId)"
        @update-portions="(recipeId, portions) => onUpdatePortions(meal.mealId, recipeId, portions)"
      />

      <DayNutritionSummary
        v-if="dayDetail && (dayDetail.meals.length > 0)"
        :nutrition="dayNutrition"
        title="Итого за день"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useMeals } from '~/composables/useMeals'

useHead({ title: 'День меню' })

const route = useRoute()
const toast = useToast()

const menuId = computed(() => Number(route.params.id))
const date = computed(() => String(route.params.day))

const { dayDetail, loading, fetchDay, updatePortions, deleteRecipe, mealsNutrition, dayNutrition } = useMeals(menuId, date)

onMounted(fetchDay)

// "24 марта 2026"
const formattedDay = computed(() => {
  const [y, m, d] = date.value.split('-')
  const dateObj = new Date(Number(y), Number(m) - 1, Number(d))
  return dateObj.toLocaleString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
})

async function onDeleteRecipe(mealId: number, recipeId: number) {
  try {
    await deleteRecipe(mealId, recipeId)
    toast.add({ title: 'Рецепт удалён', color: 'success' })
  } catch {
    toast.add({ title: 'Ошибка удаления рецепта', color: 'error' })
  }
}

async function onUpdatePortions(mealId: number, recipeId: number, portions: number) {
  try {
    await updatePortions(mealId, recipeId, portions)
    toast.add({ title: 'Количество порций обновлено', color: 'success' })
  } catch {
    toast.add({ title: 'Ошибка обновления порций', color: 'error' })
  }
}
</script>
