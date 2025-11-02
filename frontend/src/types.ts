export type Ingredient = {
  id: number
  name: string
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
}
