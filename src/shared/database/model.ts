import { openDB, type IDBPDatabase } from 'idb'
import type { MnemozaCard, Deck } from '@/shared/types/card'
import { generateUUID } from '@/shared/utils/uuid'
import { useEffect, useState } from 'react'

interface DatabaseState {
  dbInitialized: boolean
  initError: string | null
}

interface DatabaseActions {
  initializeDatabase: () => Promise<void>
}

const DB_NAME = 'MnemozaDB'
const DB_VERSION = 2

export class MnemozaDatabase {
  private db: IDBPDatabase | null = null

  async init(): Promise<void> {
    this.db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        // Создаем хранилище для колод
        if (!db.objectStoreNames.contains('decks')) {
          const deckStore = db.createObjectStore('decks', {
            keyPath: 'id',
          })
          deckStore.createIndex('name', 'name')
        }

        // Создаем хранилище для карточек
        if (!db.objectStoreNames.contains('cards')) {
          const cardStore = db.createObjectStore('cards', {
            keyPath: 'id',
          })
          cardStore.createIndex('deckId', 'deckId')
          cardStore.createIndex('nextReviewDate', 'nextReviewDate')
        } else if (oldVersion < 2) {
          // Удаляем старый индекс isNew если он существует
          const tx = db.transaction(['cards'], 'versionchange')
          const cardStore = tx.objectStore('cards')
          if (cardStore.indexNames.contains('isNew')) {
            cardStore.deleteIndex('isNew')
          }
        }
      },
    })
  }

  private ensureDB(): IDBPDatabase {
    if (!this.db) {
      throw new Error('Database not initialized. Call init() first.')
    }
    return this.db
  }

  // Операции с колодами
  async createDeck(deck: Omit<Deck, 'id'>): Promise<Deck> {
    const db = this.ensureDB()
    const newDeck: Deck = {
      ...deck,
      id: generateUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await db.add('decks', newDeck)
    return newDeck
  }

  async getDecks(): Promise<Deck[]> {
    const db = this.ensureDB()
    return await db.getAll('decks')
  }

  async getDeck(id: string): Promise<Deck | undefined> {
    const db = this.ensureDB()
    return await db.get('decks', id)
  }

  async updateDeck(deck: Deck): Promise<void> {
    const db = this.ensureDB()
    deck.updatedAt = new Date()
    await db.put('decks', deck)
  }

  async deleteDeck(id: string): Promise<void> {
    const db = this.ensureDB()
    await db.delete('decks', id)

    // Удаляем все карточки из этой колоды
    const cards = await this.getCardsByDeck(id)
    for (const card of cards) {
      await db.delete('cards', card.id)
    }
  }

  // Операции с карточками
  async createCard(
    card: Omit<MnemozaCard, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<MnemozaCard> {
    const db = this.ensureDB()
    const newCard: MnemozaCard = {
      ...card,
      id: generateUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await db.add('cards', newCard)
    return newCard
  }

  async getCard(id: string): Promise<MnemozaCard | undefined> {
    const db = this.ensureDB()
    const card = await db.get('cards', id)

    if (!card) return undefined

    // Преобразуем даты из строк обратно в Date объекты
    return {
      ...card,
      nextReviewDate: new Date(card.nextReviewDate),
      createdAt: new Date(card.createdAt),
      updatedAt: new Date(card.updatedAt),
    }
  }

  async getCardsByDeck(deckId: string): Promise<MnemozaCard[]> {
    const db = this.ensureDB()
    const cards = await db.getAllFromIndex('cards', 'deckId', deckId)

    // Преобразуем даты из строк обратно в Date объекты
    return cards.map(card => ({
      ...card,
      nextReviewDate: new Date(card.nextReviewDate),
      createdAt: new Date(card.createdAt),
      updatedAt: new Date(card.updatedAt),
    }))
  }

  async getNewCards(deckId?: string, limit = 20): Promise<MnemozaCard[]> {
    const db = this.ensureDB()
    const tx = db.transaction('cards', 'readonly')
    const store = tx.objectStore('cards')

    const cards: MnemozaCard[] = []
    let cursor = await store.openCursor()

    while (cursor && cards.length < limit) {
      const card = cursor.value
      if (card.isNew && (!deckId || card.deckId === deckId)) {
        // Преобразуем даты из строк обратно в Date объекты
        const fixedCard = {
          ...card,
          nextReviewDate: new Date(card.nextReviewDate),
          createdAt: new Date(card.createdAt),
          updatedAt: new Date(card.updatedAt),
        }
        cards.push(fixedCard)
      }
      cursor = await cursor.continue()
    }

    return cards
  }

  async getDueCards(deckId?: string): Promise<MnemozaCard[]> {
    const db = this.ensureDB()
    const now = new Date()
    const tx = db.transaction('cards', 'readonly')
    const store = tx.objectStore('cards')
    const index = store.index('nextReviewDate')

    const cards: MnemozaCard[] = []
    let cursor = await index.openCursor(IDBKeyRange.upperBound(now))

    while (cursor) {
      const card = cursor.value
      if (!card.isNew && (!deckId || card.deckId === deckId)) {
        // Преобразуем даты из строк обратно в Date объекты
        const fixedCard = {
          ...card,
          nextReviewDate: new Date(card.nextReviewDate),
          createdAt: new Date(card.createdAt),
          updatedAt: new Date(card.updatedAt),
        }
        cards.push(fixedCard)
      }
      cursor = await cursor.continue()
    }

    return cards.sort((a, b) => a.nextReviewDate.getTime() - b.nextReviewDate.getTime())
  }

  async updateCard(card: MnemozaCard): Promise<void> {
    const db = this.ensureDB()
    card.updatedAt = new Date()
    await db.put('cards', card)
  }

  async updateCardFields(cardId: string, fields: Partial<MnemozaCard>): Promise<void> {
    const db = this.ensureDB()
    const existingCard = await this.getCard(cardId)
    if (!existingCard) {
      throw new Error(`Card with id ${cardId} not found`)
    }

    const updatedCard: MnemozaCard = {
      ...existingCard,
      ...fields,
      id: cardId, // Убеждаемся что ID не изменился
      updatedAt: new Date(),
    }

    await db.put('cards', updatedCard)
  }

  async deleteCard(id: string): Promise<void> {
    const db = this.ensureDB()
    await db.delete('cards', id)
  }

  async getCardCount(deckId?: string): Promise<{ total: number; new: number; due: number }> {
    const db = this.ensureDB()
    const tx = db.transaction('cards', 'readonly')
    const store = tx.objectStore('cards')

    let total = 0
    let newCount = 0
    let due = 0
    const now = new Date()

    let cursor = await store.openCursor()
    while (cursor) {
      const card = cursor.value
      if (!deckId || card.deckId === deckId) {
        total++
        if (card.isNew) {
          newCount++
        } else {
          // Преобразуем дату и сравниваем
          const nextReviewDate = new Date(card.nextReviewDate)
          if (nextReviewDate <= now) {
            due++
          }
        }
      }
      cursor = await cursor.continue()
    }

    return { total, new: newCount, due }
  }

  async reset(): Promise<void> {
    try {
      // Закрываем текущее соединение
      if (this.db) {
        this.db.close()
        this.db = null
      }

      // Удаляем базу данных
      await new Promise((resolve, reject) => {
        const deleteReq = indexedDB.deleteDatabase(DB_NAME)
        deleteReq.onsuccess = () => resolve(true)
        deleteReq.onerror = () => reject(deleteReq.error)
      })

      // Перезагружаем
      window.location.reload()
    } catch (error) {
      console.error('Ошибка при сбросе базы данных:', error)
      throw error
    }
  }
}

export const db = new MnemozaDatabase()

export interface DatabaseModel extends DatabaseState, DatabaseActions {}

export const useDatabase = (): DatabaseModel => {
  const [dbInitialized, setDbInitialized] = useState(false)
  const [initError, setInitError] = useState<string | null>(null)

  const initializeDatabase = async () => {
    try {
      setInitError(null)
      await db.init()
      setDbInitialized(true)
    } catch (error) {
      console.error('Ошибка инициализации базы данных:', error)
      setInitError(error instanceof Error ? error.message : 'Неизвестная ошибка')
      setDbInitialized(false)
    }
  }

  useEffect(() => {
    initializeDatabase()
  }, [])

  return {
    dbInitialized,
    initError,
    initializeDatabase,
  }
}
