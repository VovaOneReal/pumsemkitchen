// Утилиты для расчёта КБЖУ и стоимости рецептов

export type UnitRow = {
  measurementUnitId: number
  measureType: string
  isStandart: boolean
}

export type ConvertRow = {
  fromUnitId: number
  toUnitId: number
  convertationCoefficient: string
}

type ProductMeasures = {
  gMeasure: string | null
  mlMeasure: string | null
  pcsMeasure: string | null
}

export type NutritionRefs = {
  allUnits: UnitRow[]
  allConverts: ConvertRow[]
  stdGramUnitId: number
  stdMlUnitId: number
}

export type NutritionValues = {
  proteins: number
  fats: number
  carbs: number
  calories: number
  cost: number
}

// Конвертация количества ингредиента в граммы
export function toGrams(
  qty: number,
  unitId: number,
  product: ProductMeasures,
  allUnits: UnitRow[],
  allConverts: ConvertRow[],
  stdGramUnitId: number,
  stdMlUnitId: number,
): number | null {
  const unit = allUnits.find(u => u.measurementUnitId === unitId)
  if (!unit) return null

  if (unit.measureType === 'weight') {
    if (unit.isStandart) return qty
    const direct = allConverts.find(c => c.fromUnitId === unitId && c.toUnitId === stdGramUnitId)
    if (direct) return qty * Number(direct.convertationCoefficient)
    const reverse = allConverts.find(c => c.fromUnitId === stdGramUnitId && c.toUnitId === unitId)
    if (reverse) return qty / Number(reverse.convertationCoefficient)
    return null
  }

  if (unit.measureType === 'volume' || unit.measureType === 'volume_extra') {
    if (!product.mlMeasure || !product.gMeasure) return null
    let mlQty = qty
    if (unitId !== stdMlUnitId) {
      const conv = allConverts.find(c => c.fromUnitId === unitId && c.toUnitId === stdMlUnitId)
      if (!conv) return null
      mlQty = qty * Number(conv.convertationCoefficient)
    }
    return (mlQty / Number(product.mlMeasure)) * Number(product.gMeasure)
  }

  if (unit.measureType === 'piece') {
    if (!product.pcsMeasure || !product.gMeasure) return null
    return (qty / Number(product.pcsMeasure)) * Number(product.gMeasure)
  }

  return null
}

type IngredientForNutrition = {
  quantity: string
  measurementUnitId: number
  isOptional: boolean
  product: ProductMeasures & {
    proteins: string | null
    fats: string | null
    carbs: string | null
    price: string | null
    quantityPerPrice: string | null
    measurementUnitId: number
    emissGood: { emissRecords: Array<{ recordPrice: string }> } | null
  }
}

// Расчёт КБЖУ и стоимости рецепта на 1 порцию.
// Формула повторяет логику recipe.vue (nutritionPer100g → nutritionPerServing),
// чтобы значения в меню совпадали с карточкой рецепта.
export function computeRecipeNutrition(
  ingredients: IngredientForNutrition[],
  basePortions: number,
  refs: NutritionRefs,
): NutritionValues {
  const { allUnits, allConverts, stdGramUnitId, stdMlUnitId } = refs
  const portions = basePortions || 1

  // Вспомогательные округления как в recipe.vue
  const round1 = (v: number) => Math.round(v * 10) / 10
  const round2 = (v: number) => Math.round(v * 100) / 100

  // --- КБЖУ: суммируем неотмасштабированные граммы всего рецепта ---
  let totalWeight = 0
  let totalProtein = 0
  let totalFat = 0
  let totalCarbs = 0

  // --- Стоимость: масштабируем к 1 порции с промежуточным округлением, как scaledAmount в recipe.vue ---
  let totalCost = 0

  for (const ing of ingredients) {
    if (ing.isOptional) continue

    const qty = Number(ing.quantity)
    const grams = toGrams(qty, ing.measurementUnitId, ing.product, allUnits, allConverts, stdGramUnitId, stdMlUnitId)
    if (grams === null) continue

    totalWeight  += grams
    totalProtein += (grams / 100) * Number(ing.product.proteins ?? 0)
    totalFat     += (grams / 100) * Number(ing.product.fats    ?? 0)
    totalCarbs   += (grams / 100) * Number(ing.product.carbs   ?? 0)

    // Если привязан товар ЕМИСС — берём его последнюю цену, иначе ручную
    const emissPrice = ing.product.emissGood?.emissRecords[0]?.recordPrice
    const price      = Number(emissPrice ?? ing.product.price ?? 0)
    const qtyPerPrice = Number(ing.product.quantityPerPrice ?? 0)
    if (price > 0 && qtyPerPrice > 0) {
      // Округляем масштабированное количество до 1 знака (как scaledAmount в recipe.vue)
      const scaledQty      = round1(qty * (1 / portions))
      const ingGrams1p     = toGrams(scaledQty, ing.measurementUnitId, ing.product, allUnits, allConverts, stdGramUnitId, stdMlUnitId)
      const priceQtyGrams  = toGrams(qtyPerPrice, ing.product.measurementUnitId, ing.product, allUnits, allConverts, stdGramUnitId, stdMlUnitId)
      if (ingGrams1p !== null && priceQtyGrams && priceQtyGrams > 0) {
        // Округление стоимости каждого ингредиента до 2 знаков, как в ingredientCosts в recipe.vue
        totalCost += round2(ingGrams1p * (price / priceQtyGrams))
      }
    }
  }

  if (totalWeight === 0) {
    return { proteins: 0, fats: 0, carbs: 0, calories: 0, cost: round2(totalCost) }
  }

  // Нормализация через 100 г блюда — идентично nutritionPer100g в recipe.vue
  const protein100g  = round1(totalProtein * 100 / totalWeight)
  const fat100g      = round1(totalFat     * 100 / totalWeight)
  const carbs100g    = round1(totalCarbs   * 100 / totalWeight)
  const calories100g = round1(protein100g * 4 + fat100g * 9 + carbs100g * 4)

  // Конвертация в значения на 1 порцию — идентично nutritionPerServing в recipe.vue
  const weightPerServing = totalWeight / portions
  const proteins  = round1(protein100g  * weightPerServing / 100)
  const fats      = round1(fat100g      * weightPerServing / 100)
  const carbs     = round1(carbs100g    * weightPerServing / 100)
  const calories  = round1(calories100g * weightPerServing / 100)

  return { proteins, fats, carbs, calories, cost: round2(totalCost) }
}
