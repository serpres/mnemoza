import type { BaseFormState, BaseFormActions } from '@/shared/types/form'
import { useState, useCallback } from 'react'

export interface AddCardFormState extends BaseFormState {
  front: string
  back: string
}

export interface AddCardFormActions extends BaseFormActions {
  setFront: (front: string) => void
  setBack: (back: string) => void
}

export interface AddCardFormModel extends AddCardFormState, AddCardFormActions {}

export const useAddCardFormModel = (): AddCardFormModel => {
  const [front, setFront] = useState('')
  const [back, setBack] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const resetForm = useCallback(() => {
    setFront('')
    setBack('')
    setError('')
    setLoading(false)
  }, [])

  return {
    front,
    back,
    loading,
    error,
    setFront,
    setBack,
    setLoading,
    setError,
    resetForm,
  }
}

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
