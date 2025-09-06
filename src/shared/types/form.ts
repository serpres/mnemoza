export interface BaseFormState {
  loading: boolean
  error: string
}

export interface BaseFormActions {
  setLoading: (loading: boolean) => void
  setError: (error: string) => void
  resetForm: () => void
}
