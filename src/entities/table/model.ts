import { useState, useCallback } from 'react'

interface TableState {
  searchTerm: string
  sortBy: 'front' | 'back' | 'created' | 'nextReview'
  sortOrder: 'asc' | 'desc'
  visibleCount: number
}

interface TableActions {
  setSearchTerm: (term: string) => void
  setSortBy: (field: 'front' | 'back' | 'created' | 'nextReview') => void
  setSortOrder: (order: 'asc' | 'desc') => void
  toggleSortOrder: () => void
  clearSearch: () => void
  showMore: () => void
}

export interface TableModel extends TableState, TableActions {}

export const useTableModel = (): TableModel => {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'front' | 'back' | 'created' | 'nextReview'>('created')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [visibleCount, setVisibleCount] = useState(10)

  const toggleSortOrder = useCallback(() => {
    setSortOrder(current => current === 'asc' ? 'desc' : 'asc')
  }, [])

  const clearSearch = useCallback(() => {
    setSearchTerm('')
  }, [])

  const showMore = useCallback(() => {
    setVisibleCount(current => current + 10)
  }, [])

  return {
    searchTerm,
    sortBy,
    sortOrder,
    visibleCount,
    setSearchTerm,
    setSortBy,
    setSortOrder,
    toggleSortOrder,
    clearSearch,
    showMore,
  }
}
