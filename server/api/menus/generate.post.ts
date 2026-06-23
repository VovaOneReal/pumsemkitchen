import { db } from '~~/server/utils/db'
import { menus, planDates, meals, mealRecipes, measurementUnitsRef, converts } from '~~/db/schema'
import { computeRecipeNutrition } from '~~/server/utils/nutrition'
import type { NutritionRefs } from '~~/server/utils/nutrition'
import { checkFamilyAccess } from '~~/server/utils/checkFamilyAccess'
import { menuGenerateSchema } from '~~/schemas/menuGenerate'

const DEFAULT_MEALS = ['Завтрак', 'Второй завтрак', 'Обед', 'Полдник', 'Ужин'] as const

// Доли суточной нормы калорий по стандартным приёмам пищи
const MEAL_PROPS: Record<string, number> = {
  'Завтрак': 0.25,
  'Второй завтрак': 0.10,
  'Обед': 0.35,
  'Полдник': 0.10,
  'Ужин': 0.20,
}

// Порядок сортировки приёмов пищи
const MEAL_ORDER_MAP: Record<string, number> = {
  'Завтрак': 1, 'Второй завтрак': 2, 'Обед': 3, 'Полдник': 4, 'Ужин': 5,
}

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event)
  const body = await readValidatedBody(event, menuGenerateSchema.parseAsync)

  const familyId = body.familyId ?? null
  if (familyId) await checkFamilyAccess(familyId, user.userId)

  // Загрузка рецептов с ингредиентами — паттерн из nutrition.get.ts
  const recipes = await db.query.recipes.findMany({
    where: (r, { eq, and, isNull }) =>
      familyId
        ? eq(r.familyId, familyId)
        : and(eq(r.userId, user.userId), isNull(r.familyId)),
    with: {
      ingredients: {
        with: {
          product: {
            with: {
              emissGood: {
                with: { emissRecords: { orderBy: (rec, { desc }) => desc(rec.recordDate), limit: 1 } },
              },
            },
          },
        },
      },
    },
  })

  const allUnits = await db.select().from(measurementUnitsRef)
  const allConverts = await db.select().from(converts)
  const stdGramUnit = allUnits.find(u => u.measureType === 'weight' && u.isStandart)
  const stdMlUnit = allUnits.find(u => u.measureType === 'volume' && u.isStandart)
  const refs: NutritionRefs = {
    allUnits,
    allConverts,
    stdGramUnitId: stdGramUnit?.measurementUnitId ?? -1,
    stdMlUnitId: stdMlUnit?.measurementUnitId ?? -1,
  }

  // Предвычисление калорий и стоимости на N порций для каждого рецепта
  const N = body.numberOfPeople
  type RecipeEntry = { id: number; calsPerN: number; costPerN: number }
  const validPool: RecipeEntry[] = []

  for (const r of recipes) {
    const n = computeRecipeNutrition(r.ingredients, r.portions, refs)
    if (n.calories > 0) {
      validPool.push({ id: r.recipeId, calsPerN: n.calories * N, costPerN: n.cost * N })
    }
  }

  if (validPool.length === 0) {
    throw createError({ statusCode: 422, statusMessage: 'Нет рецептов с данными о питательности' })
  }

  // Нормализация пропорций: берём только выбранные приёмы, суммируем до 100%
  const selectedMeals = body.selectedMeals
    .slice()
    .sort((a, b) => MEAL_ORDER_MAP[a] - MEAL_ORDER_MAP[b])

  const propSum = selectedMeals.reduce((s, m) => s + MEAL_PROPS[m], 0)
  const mealTargetCals: Record<string, number> = {}
  for (const m of selectedMeals) {
    mealTargetCals[m] = body.targetCaloriesPerDay * (MEAL_PROPS[m] / propSum)
  }

  // Генерация списка дат от dateFrom до dateTo включительно (UTC, чтобы не зависеть от таймзоны сервера)
  const dates: string[] = []
  const cur = new Date(body.dateFrom)
  const end = new Date(body.dateTo)
  while (cur <= end) {
    dates.push(cur.toISOString().slice(0, 10))
    cur.setUTCDate(cur.getUTCDate() + 1)
  }

  // Быстрый доступ к данным рецепта по id
  const recipeMap = new Map(validPool.map(r => [r.id, r]))

  type Assignment = { date: string; mealName: string; recipeId: number; portions: number }
  const assignments: Assignment[] = []
  const warnings = { budgetExceeded: false, actualCost: null as number | null, calorieDeviation: false, dayRepeat: false }

  // Основной цикл: для каждого дня и приёма пищи — случайный рецепт из диапазона
  for (const date of dates) {
    const usedToday = new Set<number>()

    for (const meal of selectedMeals) {
      const target = mealTargetCals[meal]

      // Основная полоса ±50% от цели
      let candidates = validPool.filter(
        r => !usedToday.has(r.id) && r.calsPerN >= target * 0.5 && r.calsPerN <= target * 1.5,
      )

      // Расширенная полоса ±70% — если основная пуста
      if (candidates.length === 0) {
        candidates = validPool.filter(
          r => !usedToday.has(r.id) && r.calsPerN >= target * 0.3 && r.calsPerN <= target * 2.0,
        )
      }

      // Любой не использованный сегодня рецепт
      if (candidates.length === 0) {
        candidates = validPool.filter(r => !usedToday.has(r.id))
      }

      // Крайний случай: весь пул (повтор в один день)
      if (candidates.length === 0) {
        candidates = validPool
        warnings.dayRepeat = true
      }

      const chosen = candidates[Math.floor(Math.random() * candidates.length)]
      usedToday.add(chosen.id)
      assignments.push({ date, mealName: meal, recipeId: chosen.id, portions: N })
    }
  }

  // Бюджетная корректировка — только если лимит задан
  if (body.totalBudget !== null) {
    // Множества использованных рецептов по дням для проверки уникальности при замене
    const perDayUsed = new Map<string, Set<number>>()
    for (const date of dates) perDayUsed.set(date, new Set())
    for (const a of assignments) perDayUsed.get(a.date)!.add(a.recipeId)

    let totalCost = assignments.reduce((s, a) => s + (recipeMap.get(a.recipeId)?.costPerN ?? 0), 0)

    if (totalCost > body.totalBudget) {
      // Сортируем копию — элементы те же объекты, мутация recipeId обновит оригинал
      const sorted = [...assignments].sort(
        (a, b) => (recipeMap.get(b.recipeId)?.costPerN ?? 0) - (recipeMap.get(a.recipeId)?.costPerN ?? 0),
      )

      for (const a of sorted) {
        if (totalCost <= body.totalBudget) break

        const currentCost = recipeMap.get(a.recipeId)?.costPerN ?? 0
        const dayUsed = perDayUsed.get(a.date)!
        dayUsed.delete(a.recipeId)

        // Альтернативы: дешевле и не стоят сегодня; сортируем по близости к целевым ккал
        const alternatives = validPool
          .filter(r => !dayUsed.has(r.id) && r.costPerN < currentCost)
          .sort(
            (r1, r2) =>
              Math.abs(r1.calsPerN - mealTargetCals[a.mealName]) -
              Math.abs(r2.calsPerN - mealTargetCals[a.mealName]),
          )

        if (alternatives.length > 0) {
          const best = alternatives[0]
          totalCost += best.costPerN - currentCost
          a.recipeId = best.id
          dayUsed.add(best.id)
        } else {
          dayUsed.add(a.recipeId)
        }
      }

      if (totalCost > body.totalBudget) {
        warnings.budgetExceeded = true
        warnings.actualCost = Math.round(totalCost * 100) / 100
      }
    }
  }

  // Проверка отклонения суточной калорийности от цели
  for (const date of dates) {
    const dayTotal = assignments
      .filter(a => a.date === date)
      .reduce((s, a) => s + (recipeMap.get(a.recipeId)?.calsPerN ?? 0), 0)

    if (Math.abs(dayTotal - body.targetCaloriesPerDay) / body.targetCaloriesPerDay > 0.25) {
      warnings.calorieDeviation = true
      break
    }
  }

  // Запись результата в БД — единая транзакция
  const today = new Date().toISOString().slice(0, 10)

  const menuId = await db.transaction(async (tx) => {
    const [menu] = await tx
      .insert(menus)
      .values({
        userId: user.userId,
        familyId,
        menuTitle: body.title,
        createdAt: today,
        editedAt: today,
      } as typeof menus.$inferInsert)
      .returning()

    for (const date of dates) {
      const [pd] = await tx
        .insert(planDates)
        .values({ menuId: menu.menuId, planDate: date })
        .returning()

      // Все 5 стандартных приёмов пищи — аналогично plan-dates/index.post.ts
      const insertedMeals = await tx
        .insert(meals)
        .values(DEFAULT_MEALS.map((title, i) => ({ planDateId: pd.planDateId, mealTitle: title, mealOrder: i + 1 })))
        .returning()

      const mealByName = new Map(insertedMeals.map(m => [m.mealTitle, m.mealId]))

      for (const a of assignments.filter(a => a.date === date)) {
        const mealId = mealByName.get(a.mealName)
        if (mealId === undefined) continue
        await tx.insert(mealRecipes).values({ mealId, recipeId: a.recipeId, mealPortions: a.portions })
      }
    }

    return menu.menuId
  })

  return { menuId, warnings }
})
