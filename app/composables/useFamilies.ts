import type { Family, FamilyDetail, Invitation } from '@/types'

export const useFamilies = () => {
  const families = useState<Family[]>('families', () => [])
  const loading = ref(false)
  const creating = ref(false)
  const deletingId = ref<number | null>(null)
  const editingId = ref<number | null>(null)
  const leavingId = ref<number | null>(null)
  const invitationsLoading = ref(false)

  const fetchFamilies = async () => {
    loading.value = true
    try {
      families.value = await $fetch<Family[]>('/api/families')
    } finally {
      loading.value = false
    }
  }

  const createFamily = async (title: string) => {
    creating.value = true
    try {
      const created = await $fetch<Family>('/api/families', { method: 'POST', body: { title } })
      families.value.unshift(created)
      return created
    } finally {
      creating.value = false
    }
  }

  const updateFamily = async (id: number, title: string) => {
    editingId.value = id
    try {
      const updated = await $fetch<Family>(`/api/families/${id}`, { method: 'PATCH', body: { title } })
      const idx = families.value.findIndex((f) => f.id === id)
      if (idx !== -1) families.value[idx] = updated
      return updated
    } finally {
      editingId.value = null
    }
  }

  const deleteFamily = async (id: number) => {
    deletingId.value = id
    try {
      await $fetch(`/api/families/${id}`, { method: 'DELETE' })
      families.value = families.value.filter((f) => f.id !== id)
    } finally {
      deletingId.value = null
    }
  }

  const leaveFamily = async (id: number) => {
    leavingId.value = id
    try {
      const result = await $fetch<{ success: boolean; familyDeleted?: boolean }>(`/api/families/${id}/leave`, {
        method: 'POST',
      })
      families.value = families.value.filter((f) => f.id !== id)
      return result
    } finally {
      leavingId.value = null
    }
  }

  const kickMember = async (familyId: number, userId: number) => {
    await $fetch(`/api/families/${familyId}/kick`, { method: 'POST', body: { userId } })
  }

  const inviteMember = async (familyId: number, login: string) => {
    await $fetch(`/api/families/${familyId}/invite`, { method: 'POST', body: { login } })
  }

  const fetchMembers = async (id: number) => {
    return await $fetch<FamilyDetail>(`/api/families/${id}`)
  }

  const fetchInvitations = async () => {
    invitationsLoading.value = true
    try {
      return await $fetch<Invitation[]>('/api/invitations')
    } finally {
      invitationsLoading.value = false
    }
  }

  const respondInvitation = async (id: number, accept: boolean) => {
    await $fetch(`/api/invitations/${id}/respond`, { method: 'POST', body: { accept } })
  }

  return {
    families,
    loading,
    creating,
    deletingId,
    editingId,
    leavingId,
    invitationsLoading,
    fetchFamilies,
    createFamily,
    updateFamily,
    deleteFamily,
    leaveFamily,
    kickMember,
    inviteMember,
    fetchMembers,
    fetchInvitations,
    respondInvitation,
  }
}
