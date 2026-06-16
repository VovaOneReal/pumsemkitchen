export type Ingredient = {
  id: number
  productId: number
  name: string
  note: string | null
  isOptional: boolean
  amount: number
  measurementUnitId: number
  amountType: string
}

export type RecipeStep = {
  step: number
  description: string
  pictureUrl: string | null
}

export type Recipe = {
  id: number
  title: string
  description: string | null
  cookingTimeMin: number | null
  portions: number
  isPublic: boolean
  pictureUrl: string | null
  sourceUrl: string | null
  createdAt: string
  editedAt: string
  authorName: string
}

export type RecipeDetail = Recipe & {
  ingredients: Ingredient[]
  steps: RecipeStep[]
}

export type Menu = {
  id: number
  title: string
  authorName: string
  createdAt: string
  editedAt: string
  editorName: string | null
  dateFrom: string | null
  dateTo: string | null
  estimatedCost: number | null
}

export type ShoppingList = {
  id: number
  title: string
  authorName: string
  createdAt: string
  editorName: string | null
  editedAt: string
}

export type Product = {
  id: number
  name: string
  image: string | null
  priceRub: number
  priceQty: number
  priceUnit: string
  protein: number
  fat: number
  carbs: number
  calories: number
  isPublic?: boolean
  isOwn?: boolean
  measurementUnitId?: number
  authorName?: string
  createdAt?: string
  modifierName?: string
  updatedAt?: string
  nutritionsFromProductName?: string | null
  priceFromProductName?: string | null
  gMeasure: number | null
  mlMeasure: number | null
  pcsMeasure: number | null
}
