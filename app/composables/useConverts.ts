export type Convert = {
  fromUnitId: number
  toUnitId: number
  coefficient: number
}

export const useConverts = () => {
  const converts = useState<Convert[]>('converts', () => [])

  const fetchConverts = async () => {
    if (converts.value.length > 0) return
    converts.value = await $fetch<Convert[]>('/api/converts')
  }

  return { converts, fetchConverts }
}
