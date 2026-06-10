export type Ingredient = {
  id: number
  name: string
  note: string
  isOptional: boolean
  amount: number
  amountType: string
}

export type RecipeStep = {
  step: number
  description: string
}

export type Recipe = {
  id: number
  title: string
  description: string
  authorName: string
  createdAt: string
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
}
