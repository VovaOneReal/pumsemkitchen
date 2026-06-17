import type { PlanDate } from '~~/app/types'

export const usePlanDates = (menuId: Ref<number>) => {
  const planDates = useState<PlanDate[]>(`plan-dates-${menuId.value}`, () => [])
  const menuTitle = ref('')
  const loading = ref(false)

  const fetchPlanDates = async () => {
    loading.value = true
    try {
      const data = await $fetch<{ menuTitle: string; planDates: PlanDate[] }>(
        `/api/menus/${menuId.value}/plan-dates`,
      )
      menuTitle.value = data.menuTitle
      planDates.value = data.planDates
    } finally {
      loading.value = false
    }
  }

  const createPlanDate = async (planDate: string) => {
    const created = await $fetch<PlanDate>(`/api/menus/${menuId.value}/plan-dates`, {
      method: 'POST',
      body: { planDate },
    })
    planDates.value = [...planDates.value, created]
    return created
  }

  const updatePlanDate = async (planDateId: number, planDate: string) => {
    const updated = await $fetch<PlanDate>(
      `/api/menus/${menuId.value}/plan-dates/${planDateId}`,
      { method: 'PATCH', body: { planDate } },
    )
    planDates.value = planDates.value.map((pd) => (pd.planDateId === planDateId ? updated : pd))
    return updated
  }

  const deletePlanDate = async (planDateId: number) => {
    await $fetch(`/api/menus/${menuId.value}/plan-dates/${planDateId}`, { method: 'DELETE' })
    planDates.value = planDates.value.filter((pd) => pd.planDateId !== planDateId)
  }

  return { planDates, menuTitle, loading, fetchPlanDates, createPlanDate, updatePlanDate, deletePlanDate }
}
