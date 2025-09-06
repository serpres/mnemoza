import type { BaseFormState, BaseFormActions } from '@/shared/types/form'
import { useState, useCallback } from 'react'

export interface CreateDeckFormState extends BaseFormState {
  name: string
  description: string
}

export interface CreateDeckFormActions extends BaseFormActions {
  setName: (name: string) => void
  setDescription: (description: string) => void
}

export interface CreateDeckFormModel extends CreateDeckFormState, CreateDeckFormActions {}

export const useCreateDeckFormModel = (): CreateDeckFormModel => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const resetForm = useCallback(() => {
    setName('')
    setDescription('')
    setError('')
    setLoading(false)
  }, [])

  return {
    name,
    description,
    loading,
    error,
    setName,
    setDescription,
    setLoading,
    setError,
    resetForm,
  }
}