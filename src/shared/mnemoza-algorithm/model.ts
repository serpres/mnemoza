import type { MnemozaCard, ReviewResult } from '../types/card'
import { ReviewResult as ReviewResultValues } from '../types/card'
import { generateUUID } from '../utils/uuid'


export class MnemozaAlgorithm {
  private static readonly INITIAL_INTERVAL = 1 // дни
  private static readonly INITIAL_EASE_FACTOR = 2.5
  private static readonly MIN_EASE_FACTOR = 1.3
  private static readonly EASE_FACTOR_CHANGE = 0.1
  
  // Интервалы для новых карточек (в минутах и днях)
  private static readonly NEW_CARD_INTERVALS = {
    AGAIN: 1, // 1 минута
    HARD: 10, // 10 минут  
    GOOD: 1440, // 1 день в минутах
    EASY: 5760, // 4 дня в минутах
  }


  static createNewCard(front: string, back: string, deckId: string): MnemozaCard {
    const now = new Date()

    return {
      id: generateUUID(),
      front,
      back,
      deckId,
      interval: this.INITIAL_INTERVAL,
      repetitions: 0,
      easeFactor: this.INITIAL_EASE_FACTOR,
      nextReviewDate: now, // сейчас - чтобы правильно отображалось в списке
      createdAt: now,
      updatedAt: now,
      isNew: true,
    }
  }

  static updateCard(card: MnemozaCard, result: ReviewResult): MnemozaCard {
    const now = new Date()
    let newInterval = card.interval
    let newRepetitions = card.repetitions
    let newEaseFactor = card.easeFactor
    let nextReviewDate: Date
    let isNewCard = card.isNew

    // Для новых карточек используем специальные интервалы
    if (card.isNew) {
      switch (result) {
        case ReviewResultValues.AGAIN:
          newInterval = this.NEW_CARD_INTERVALS.AGAIN / (24 * 60) // конвертируем минуты в дни
          newRepetitions = 0
          nextReviewDate = new Date(now.getTime() + this.NEW_CARD_INTERVALS.AGAIN * 60 * 1000)
          isNewCard = true // остается в обучении
          break

        case ReviewResultValues.HARD:
          newInterval = this.NEW_CARD_INTERVALS.HARD / (24 * 60) // конвертируем минуты в дни
          newRepetitions = 0
          nextReviewDate = new Date(now.getTime() + this.NEW_CARD_INTERVALS.HARD * 60 * 1000)
          isNewCard = true // остается в обучении
          break

        case ReviewResultValues.GOOD:
          newInterval = 1 // 1 день
          newRepetitions = 1
          nextReviewDate = new Date(now.getTime() + 24 * 60 * 60 * 1000)
          isNewCard = false // выходит из обучения
          break

        case ReviewResultValues.EASY:
          newInterval = 4 // 4 дня
          newRepetitions = 1
          nextReviewDate = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000)
          isNewCard = false // выходит из обучения
          break

        default:
          throw new Error(`Неизвестный результат повторения: ${result}`)
      }
    } else {
      // Для карточек в повторении используем SM-2 алгоритм
      switch (result) {
        case ReviewResultValues.AGAIN:
          // Сброс в обучение
          newInterval = this.NEW_CARD_INTERVALS.AGAIN / (24 * 60)
          newRepetitions = 0
          newEaseFactor = Math.max(
            card.easeFactor - 0.2,
            this.MIN_EASE_FACTOR
          )
          nextReviewDate = new Date(now.getTime() + this.NEW_CARD_INTERVALS.AGAIN * 60 * 1000)
          isNewCard = true // возвращается в обучение
          break

        case ReviewResultValues.HARD:
          newInterval = Math.max(1, Math.round(card.interval * 1.2))
          newRepetitions = card.repetitions + 1
          newEaseFactor = Math.max(
            card.easeFactor - this.EASE_FACTOR_CHANGE,
            this.MIN_EASE_FACTOR
          )
          nextReviewDate = new Date(now.getTime() + newInterval * 24 * 60 * 60 * 1000)
          break

        case ReviewResultValues.GOOD:
          newInterval = Math.round(card.interval * card.easeFactor)
          newRepetitions = card.repetitions + 1
          nextReviewDate = new Date(now.getTime() + newInterval * 24 * 60 * 60 * 1000)
          break

        case ReviewResultValues.EASY:
          newInterval = Math.round(card.interval * card.easeFactor * 1.3) + 4 // +4 дня бонус
          newRepetitions = card.repetitions + 1
          newEaseFactor = card.easeFactor + this.EASE_FACTOR_CHANGE
          nextReviewDate = new Date(now.getTime() + newInterval * 24 * 60 * 60 * 1000)
          break

        default:
          throw new Error(`Неизвестный результат повторения: ${result}`)
      }
    }

    return {
      ...card,
      interval: newInterval,
      repetitions: newRepetitions,
      easeFactor: newEaseFactor,
      nextReviewDate,
      updatedAt: now,
      isNew: isNewCard,
    }
  }

  static getButtonColor(result: ReviewResult): string {
    switch (result) {
      case ReviewResultValues.AGAIN:
        return 'bg-red-500 hover:bg-red-600'
      case ReviewResultValues.HARD:
        return 'bg-orange-500 hover:bg-orange-600'
      case ReviewResultValues.GOOD:
        return 'bg-green-500 hover:bg-green-600'
      case ReviewResultValues.EASY:
        return 'bg-blue-500 hover:bg-blue-600'
      default:
        return 'bg-gray-500 hover:bg-gray-600'
    }
  }

  static getButtonIntervalText(card: MnemozaCard, result: ReviewResult): string {
    // Для новых карточек показываем точные интервалы
    if (card.isNew) {
      switch (result) {
        case ReviewResultValues.AGAIN:
          return '1м'
        case ReviewResultValues.HARD:
          return '10м'
        case ReviewResultValues.GOOD:
          return '1 день'
        case ReviewResultValues.EASY:
          return '4 дня'
        default:
          return '?'
      }
    }
    
    // Для карточек в повторении вычисляем интервал
    const tempCard = this.updateCard(card, result)
    
    // Если карточка сбрасывается в обучение
    if (tempCard.isNew) {
      return '1м'
    }
    
    const days = tempCard.interval

    if (days < 1) {
      const minutes = Math.round(days * 24 * 60)
      return `${minutes}м`
    } else if (days === 1) {
      return '1 день'
    } else if (days < 30) {
      return `${Math.round(days)} дн.`
    } else if (days < 365) {
      const months = Math.round(days / 30)
      return `${months} мес.`
    } else {
      const years = Math.round(days / 365)
      return `${years} г.`
    }
  }

  static isDue(card: MnemozaCard): boolean {
    return card.nextReviewDate <= new Date()
  }

  static getCardStats(cards: MnemozaCard[]) {
    const now = new Date()
    const stats = {
      total: cards.length,
      new: 0,
      due: 0,
      learned: 0,
    }

    cards.forEach(card => {
      if (card.isNew) {
        stats.new++
      } else if (card.nextReviewDate <= now) {
        stats.due++
      } else {
        stats.learned++
      }
    })

    return stats
  }
}
