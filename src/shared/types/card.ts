export interface MnemozaCard {
  id: string
  front: string
  back: string
  deckId: string

  interval: number // Интервал в днях до следующего повторения
  repetitions: number // Количество успешных повторений подряд
  easeFactor: number // Коэффициент легкости (начальное значение 2.5)
  nextReviewDate: Date // Дата следующего повторения

  // Метаданные
  createdAt: Date
  updatedAt: Date
  isNew: boolean // Новая карточка (ещё не изучалась)
}

export interface Deck {
  id: string
  name: string
  description?: string
  createdAt: Date
  updatedAt: Date
}

export const ReviewResult = {
  AGAIN: 'again', // Забыл - повторить завтра
  HARD: 'hard', // Сложно - через несколько дней
  GOOD: 'good', // Нормально - стандартный интервал
  EASY: 'easy', // Легко - увеличенный интервал
} as const

export type ReviewResult = (typeof ReviewResult)[keyof typeof ReviewResult]

export interface StudySession {
  cardsStudied: number
  newCards: number
  reviewCards: number
  startTime: Date
  endTime?: Date
}
