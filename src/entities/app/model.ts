import { useState, useCallback } from 'react'
import type { Deck } from '@/shared/types/card'

type AppView = 'decks' | 'deck' | 'study'

interface AppState {
  currentView: AppView
  selectedDeck: Deck | null
  showCreateDeckModal: boolean
}

interface AppActions {
  setCurrentView: (view: AppView) => void
  selectDeck: (deck: Deck) => void
  startStudy: (deck: Deck) => void
  backToDecks: () => void
  backToDeck: () => void
  openCreateDeckModal: () => void
  closeCreateDeckModal: () => void
}

export interface AppModel extends AppState, AppActions {}

export const useAppModel = (): AppModel => {
  const [currentView, setCurrentView] = useState<AppView>('decks')
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null)
  const [showCreateDeckModal, setShowCreateDeckModal] = useState(false)

  const selectDeck = useCallback((deck: Deck) => {
    setSelectedDeck(deck)
    setCurrentView('deck')
  }, [])

  const startStudy = useCallback((deck: Deck) => {
    setSelectedDeck(deck)
    setCurrentView('study')
  }, [])

  const backToDecks = useCallback(() => {
    setSelectedDeck(null)
    setCurrentView('decks')
  }, [])

  const backToDeck = useCallback(() => {
    setCurrentView('deck')
  }, [])

  const openCreateDeckModal = useCallback(() => {
    setShowCreateDeckModal(true)
  }, [])

  const closeCreateDeckModal = useCallback(() => {
    setShowCreateDeckModal(false)
  }, [])

  return {
    currentView,
    selectedDeck,
    showCreateDeckModal,
    setCurrentView,
    selectDeck,
    startStudy,
    backToDecks,
    backToDeck,
    openCreateDeckModal,
    closeCreateDeckModal,
  }
}
