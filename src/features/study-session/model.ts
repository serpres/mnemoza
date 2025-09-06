import { useCallback, useEffect, useState } from 'react'
import { MnemozaAlgorithm } from '@/shared/mnemoza-algorithm'
import { db } from '@/shared/database'
import type { MnemozaCard, ReviewResult } from '@/shared/types/card'
import { ReviewResult as ReviewResultValues } from '@/shared/types/card'

interface StudyState {
  cards: MnemozaCard[]
  currentCardIndex: number
  showAnswer: boolean
  loading: boolean
  studying: boolean
  sessionStats: {
    cardsStudied: number
    correct: number
    startTime: Date
  }
  progress: number
  currentCard: MnemozaCard | undefined
  hasCards: boolean
}

interface StudyActions {
  loadStudyCards: () => Promise<void>
  handleReview: (
    result: ReviewResult
  ) => Promise<{ sessionCompleted: boolean; error?: unknown } | undefined>
  showCardAnswer: () => void
}

export interface StudySessionModel extends StudyState, StudyActions {}

// Утилитарные функции для изучения
export const studyUtils = {
  formatTime: (date: Date): string => {
    const minutes = Math.floor((new Date().getTime() - date.getTime()) / 60000)
    return minutes < 1 ? 'меньше минуты' : `${minutes} мин.`
  },

  calculateProgress: (currentIndex: number, totalCards: number): number => {
    return totalCards > 0 ? (currentIndex / totalCards) * 100 : 0
  },

  getSessionSummary: (stats: { cardsStudied: number; correct: number; startTime: Date }) => {
    const accuracy =
      stats.cardsStudied > 0 ? Math.round((stats.correct / stats.cardsStudied) * 100) : 0
    const duration = studyUtils.formatTime(stats.startTime)

    return {
      accuracy,
      duration,
      totalStudied: stats.cardsStudied,
      correctAnswers: stats.correct,
      incorrectAnswers: stats.cardsStudied - stats.correct,
    }
  },

  shouldShowCard: (card: MnemozaCard): boolean => {
    return card.isNew || card.nextReviewDate <= new Date()
  },
}

export const useStudySessionModel = (deckId: string): StudySessionModel => {
  const [cards, setCards] = useState<MnemozaCard[]>([])
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [loading, setLoading] = useState(true)
  const [studying, setStudying] = useState(false)
  const [sessionStats, setSessionStats] = useState({
    cardsStudied: 0,
    correct: 0,
    startTime: new Date(),
  })

  const loadStudyCards = useCallback(async () => {
    try {
      const [newCards, dueCards] = await Promise.all([
        db.getNewCards(deckId, 20),
        db.getDueCards(deckId),
      ])

      const studyCards = [...dueCards, ...newCards]
      setCards(studyCards)

      if (studyCards.length === 0) {
        setLoading(false)
        return
      }

      setCurrentCardIndex(0)
      setShowAnswer(false)
    } catch (error) {
      console.error('Ошибка загрузки карточек для изучения:', error)
    } finally {
      setLoading(false)
    }
  }, [deckId])

  useEffect(() => {
    loadStudyCards()
  }, [loadStudyCards])

  const handleReview = useCallback(
    async (result: ReviewResult) => {
      if (studying || cards.length === 0) return

      setStudying(true)

      try {
        const currentCard = cards[currentCardIndex]
        const updatedCard = MnemozaAlgorithm.updateCard(currentCard, result)

        await db.updateCard(updatedCard)

        setSessionStats(prev => ({
          ...prev,
          cardsStudied: prev.cardsStudied + 1,
          correct:
            prev.correct +
            (result === ReviewResultValues.GOOD || result === ReviewResultValues.EASY ? 1 : 0),
        }))

        const nextIndex = currentCardIndex + 1
        if (nextIndex >= cards.length) {
          return { sessionCompleted: true }
        }

        setCurrentCardIndex(nextIndex)
        setShowAnswer(false)
        return { sessionCompleted: false }
      } catch (error) {
        console.error('Ошибка обновления карточки:', error)
        return { sessionCompleted: false, error }
      } finally {
        setStudying(false)
      }
    },
    [studying, cards, currentCardIndex]
  )

  const showCardAnswer = useCallback(() => {
    setShowAnswer(true)
  }, [])

  const currentCard = cards[currentCardIndex]
  const progress = studyUtils.calculateProgress(currentCardIndex, cards.length)

  return {
    cards,
    currentCard,
    currentCardIndex,
    showAnswer,
    loading,
    studying,
    sessionStats,
    progress,
    handleReview,
    showCardAnswer,
    loadStudyCards,
    hasCards: cards.length > 0,
  }
}
