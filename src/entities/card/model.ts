import { useCallback, useEffect, useState } from 'react'
import { MnemozaAlgorithm } from '@/shared/mnemoza-algorithm'
import { db } from '@/shared/database'
import type { MnemozaCard } from '@/shared/types/card'
import { eventBus, EVENTS } from '@/shared/utils/events'

interface CardState {
  cards: MnemozaCard[]
  stats: { total: number; new: number; due: number }
  loading: boolean
}

interface CardActions {
  loadCards: () => Promise<void>
  createCard: (front: string, back: string) => Promise<MnemozaCard>
  updateCard: (card: MnemozaCard) => Promise<void>
  deleteCard: (cardId: string) => Promise<void>
}

export interface CardModel extends CardState, CardActions {}

export const cardUtils = {
  validateCardContent: (front: string, back: string): { isValid: boolean; error?: string } => {
    const trimmedFront = front.trim()
    const trimmedBack = back.trim()

    if (!trimmedFront || !trimmedBack) {
      return { isValid: false, error: 'Оба поля должны быть заполнены' }
    }

    if (trimmedFront.length > 1000) {
      return { isValid: false, error: 'Лицевая сторона слишком длинная (максимум 1000 символов)' }
    }

    if (trimmedBack.length > 1000) {
      return { isValid: false, error: 'Обратная сторона слишком длинная (максимум 1000 символов)' }
    }

    return { isValid: true }
  },

  getCardStatus: (card: MnemozaCard) => {
    if (card.isNew) {
      return {
        icon: '⭐',
        text: 'Новая',
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-800',
      }
    }

    const isDue = card.nextReviewDate <= new Date()
    if (isDue) {
      return {
        icon: '🔄',
        text: 'К повторению',
        bgColor: 'bg-red-100',
        textColor: 'text-red-800',
      }
    }

    return {
      icon: '✅',
      text: 'Изучена',
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
    }
  },

  getNextReviewText: (date: Date): string => {
    const now = new Date()
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays <= 0) return 'Сегодня'
    if (diffDays === 1) return 'Завтра'
    return `${diffDays} дн.`
  },

  filterCards: (cards: MnemozaCard[], searchTerm: string): MnemozaCard[] => {
    if (!searchTerm.trim()) return cards

    const term = searchTerm.toLowerCase()
    return cards.filter(
      card => card.front.toLowerCase().includes(term) || card.back.toLowerCase().includes(term)
    )
  },
}

export const useCardModel = (deckId: string): CardModel => {
  const [cards, setCards] = useState<MnemozaCard[]>([])
  const [stats, setStats] = useState({ total: 0, new: 0, due: 0 })
  const [loading, setLoading] = useState(true)

  const loadCards = useCallback(async () => {
    if (!deckId) return

    try {
      const [deckCards, deckStats] = await Promise.all([
        db.getCardsByDeck(deckId),
        db.getCardCount(deckId),
      ])
      setCards(deckCards)
      setStats(deckStats)
    } catch (error) {
      console.error('Ошибка загрузки карточек:', error)
    } finally {
      setLoading(false)
    }
  }, [deckId])

  useEffect(() => {
    loadCards()

    const handleCardChange = () => loadCards()
    eventBus.on(EVENTS.CARD_CREATED, handleCardChange)
    eventBus.on(EVENTS.CARD_DELETED, handleCardChange)
    eventBus.on(EVENTS.DECK_CREATED, handleCardChange)

    return () => {
      eventBus.off(EVENTS.CARD_CREATED, handleCardChange)
      eventBus.off(EVENTS.CARD_DELETED, handleCardChange)
      eventBus.off(EVENTS.DECK_CREATED, handleCardChange)
    }
  }, [loadCards])

  const createCard = useCallback(
    async (front: string, back: string) => {
      const validation = cardUtils.validateCardContent(front, back)
      if (!validation.isValid) {
        throw new Error(validation.error)
      }

      try {
        const newCardData = MnemozaAlgorithm.createNewCard(front.trim(), back.trim(), deckId)
        const newCard = await db.createCard(newCardData)
        eventBus.emit(EVENTS.CARD_CREATED, { card: newCard, deckId })
        await loadCards()
        return newCard
      } catch (error) {
        console.error('Ошибка создания карточки:', error)
        throw error
      }
    },
    [deckId, loadCards]
  )

  const updateCard = useCallback(
    async (card: MnemozaCard) => {
      try {
        await db.updateCard(card)
        await loadCards()
      } catch (error) {
        console.error('Ошибка обновления карточки:', error)
        throw error
      }
    },
    [loadCards]
  )

  const deleteCard = useCallback(
    async (cardId: string) => {
      try {
        await db.deleteCard(cardId)
        eventBus.emit(EVENTS.CARD_DELETED, { cardId, deckId })
        await loadCards()
      } catch (error) {
        console.error('Ошибка удаления карточки:', error)
        throw error
      }
    },
    [deckId, loadCards]
  )

  return {
    cards,
    stats,
    loading,
    loadCards,
    createCard,
    updateCard,
    deleteCard,
  }
}
