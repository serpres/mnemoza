import { useCallback, useEffect, useState } from 'react'
import { db } from '@/shared/database'
import type { Deck } from '@/shared/types/card'
import { eventBus, EVENTS } from '@/shared/utils/events'

interface DeckState {
  decks: Deck[]
  deckStats: Record<string, { total: number; new: number; due: number }>
  loading: boolean
}

interface DeckActions {
  loadDecks: () => Promise<void>
  createDeck: (name: string, description?: string) => Promise<Deck>
  deleteDeck: (deckId: string, forceDelete?: boolean) => Promise<boolean>
  refreshDecks: () => Promise<void>
}

export interface DeckModel extends DeckState, DeckActions {}

export const deckUtils = {
  getCardWord: (count: number): string => {
    if (count % 10 === 1 && count % 100 !== 11) {
      return 'карточка'
    } else if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) {
      return 'карточки'
    } else {
      return 'карточек'
    }
  },

  formatDeckStats: (stats: { total: number; new: number; due: number }) => ({
    total: stats.total,
    new: stats.new,
    due: stats.due,
    learned: stats.total - stats.new - stats.due,
  }),

  validateDeckName: (name: string): { isValid: boolean; error?: string } => {
    const trimmedName = name.trim()
    if (!trimmedName) {
      return { isValid: false, error: 'Название колоды обязательно' }
    }
    if (trimmedName.length > 100) {
      return { isValid: false, error: 'Название слишком длинное (максимум 100 символов)' }
    }
    return { isValid: true }
  },
}

export const useDeckModel = (): DeckModel => {
  const [decks, setDecks] = useState<Deck[]>([])
  const [deckStats, setDeckStats] = useState<
    Record<string, { total: number; new: number; due: number }>
  >({})
  const [loading, setLoading] = useState(true)

  const loadDecks = useCallback(async () => {
    try {
      const loadedDecks = await db.getDecks()
      setDecks(loadedDecks)

      const stats: Record<string, { total: number; new: number; due: number }> = {}
      for (const deck of loadedDecks) {
        stats[deck.id] = await db.getCardCount(deck.id)
      }
      setDeckStats(stats)
    } catch (error) {
      console.error('Ошибка загрузки колод:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDecks()

    let timeoutId: number
    const debouncedLoad = () => {
      clearTimeout(timeoutId)
      timeoutId = window.setTimeout(loadDecks, 300)
    }

    const handleDeckCreated = () => debouncedLoad()
    const handleCardCreated = () => debouncedLoad()
    const handleCardDeleted = () => debouncedLoad()

    eventBus.on(EVENTS.DECK_CREATED, handleDeckCreated)
    eventBus.on(EVENTS.CARD_CREATED, handleCardCreated)
    eventBus.on(EVENTS.CARD_DELETED, handleCardDeleted)

    return () => {
      clearTimeout(timeoutId)
      eventBus.off(EVENTS.DECK_CREATED, handleDeckCreated)
      eventBus.off(EVENTS.CARD_CREATED, handleCardCreated)
      eventBus.off(EVENTS.CARD_DELETED, handleCardDeleted)
    }
  }, [loadDecks])

  const createDeck = useCallback(
    async (name: string, description?: string) => {
      const validation = deckUtils.validateDeckName(name)
      if (!validation.isValid) {
        throw new Error(validation.error)
      }

      try {
        const newDeck = await db.createDeck({
          name: name.trim(),
          description: description?.trim() || undefined,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        setDecks(prevDecks => [...prevDecks, newDeck])
        eventBus.emit(EVENTS.DECK_CREATED, newDeck)
        await loadDecks()
        return newDeck
      } catch (error) {
        console.error('Ошибка создания колоды:', error)
        throw error
      }
    },
    [loadDecks]
  )

  const deleteDeck = useCallback(
    async (deckId: string): Promise<boolean> => {
      try {

        const cards = await db.getCardsByDeck(deckId)
        for (const card of cards) {
          await db.deleteCard(card.id)
        }

        await db.deleteDeck(deckId)
        setDecks(prevDecks => prevDecks.filter(deck => deck.id !== deckId))
        await loadDecks()
        return true
      } catch (error) {
        console.error('Ошибка удаления колоды:', error)
        return false
      }
    },
    [loadDecks]
  )

  const refreshDecks = useCallback(async () => {
    await loadDecks()
  }, [loadDecks])

  return {
    decks,
    deckStats,
    loading,
    loadDecks,
    createDeck,
    deleteDeck,
    refreshDecks,
  }
}
