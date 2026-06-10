export const useRecipeState = () => {
  const isCreating = useState('recipe-is-creating', () => false)

  return {
    isCreating,
    startCreating: () => {
      isCreating.value = true
    },
    stopCreating: () => {
      isCreating.value = false
    },
  }
}
