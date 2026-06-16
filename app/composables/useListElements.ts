import type { ListElement } from '@/types'
import type { CreateListElementForm, UpdateListElementForm } from '~~/schemas/list-element'

export const useListElements = () => {
  const loading = ref(false)
  const addingElement = ref(false)
  const updatingId = ref<number | null>(null)
  const deletingId = ref<number | null>(null)
  const checkingId = ref<number | null>(null)

  const fetchElements = async (listId: number): Promise<ListElement[]> => {
    loading.value = true
    try {
      return await $fetch<ListElement[]>(`/api/shopping-lists/${listId}/elements`)
    } finally {
      loading.value = false
    }
  }

  const createElement = async (listId: number, data: CreateListElementForm): Promise<ListElement> => {
    addingElement.value = true
    try {
      return await $fetch<ListElement>(`/api/shopping-lists/${listId}/elements`, {
        method: 'POST',
        body: data,
      })
    } finally {
      addingElement.value = false
    }
  }

  const updateElement = async (listId: number, elementId: number, data: UpdateListElementForm): Promise<ListElement> => {
    updatingId.value = elementId
    try {
      return await $fetch<ListElement>(`/api/shopping-lists/${listId}/elements/${elementId}`, {
        method: 'PATCH',
        body: data,
      })
    } finally {
      updatingId.value = null
    }
  }

  const checkElement = async (listId: number, elementId: number, isChecked: boolean): Promise<ListElement> => {
    checkingId.value = elementId
    try {
      return await $fetch<ListElement>(`/api/shopping-lists/${listId}/elements/${elementId}`, {
        method: 'PATCH',
        body: { isChecked },
      })
    } finally {
      checkingId.value = null
    }
  }

  const deleteElement = async (listId: number, elementId: number): Promise<void> => {
    deletingId.value = elementId
    try {
      await $fetch(`/api/shopping-lists/${listId}/elements/${elementId}`, { method: 'DELETE' })
    } finally {
      deletingId.value = null
    }
  }

  return {
    loading,
    addingElement,
    updatingId,
    deletingId,
    checkingId,
    fetchElements,
    createElement,
    updateElement,
    checkElement,
    deleteElement,
  }
}
