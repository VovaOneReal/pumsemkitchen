export type MeasurementUnit = {
  measurement_unit_id: number
  unit_name: string
  unit_plural_name: string | null
  measure_type: 'piece' | 'weight' | 'volume'
  is_standart: boolean
}

export const useMeasurements = () => {
  const measurements = useState<MeasurementUnit[]>('measurements', () => [])
  const loading = ref(false)

  const fetchMeasurements = async () => {
    if (measurements.value.length > 0) return
    loading.value = true
    try {
      measurements.value = await $fetch<MeasurementUnit[]>('/api/measurements')
    } finally {
      loading.value = false
    }
  }

  return { measurements, loading, fetchMeasurements }
}
