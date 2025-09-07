import { useCallback,  } from 'react'
import { db } from '@/shared/database'
import type { MnemozaCard, Deck } from '@/shared/types/card'
import { useAlertModel } from '@/shared/utils/alert'

export interface ExportData {
  version: string
  exportDate: string
  decks: Deck[]
  cards: MnemozaCard[]
}

interface DataManagementState {
  isExporting: boolean
  isImporting: boolean
}

interface DataManagementActions {
  exportAllData: () => Promise<void>
  importData: (file: File) => Promise<void>
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export interface DataManagementModel extends DataManagementState, DataManagementActions {
  statusModel: ReturnType<typeof useAlertModel>
}

export const useDataManagementModel = (onDataImported?: () => void): DataManagementModel => {
  const statusModel = useAlertModel()

  const exportAllData = useCallback(async () => {
    try {
      statusModel.showStatus('info', 'Начните экспорт данных...')

      const decks = await db.getDecks()
      const allCards: MnemozaCard[] = []

      for (const deck of decks) {
        const deckCards = await db.getCardsByDeck(deck.id)
        allCards.push(...deckCards)
      }

      const exportData: ExportData = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        decks,
        cards: allCards,
      }

      const dataStr = JSON.stringify(exportData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })

      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Mnemoza-backup-${new Date().toISOString().split('T')[0]}.json`

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      statusModel.showStatus(
        'success',
        `Экспортировано ${decks.length} колод и ${allCards.length} карточек`
      )
    } catch (error) {
      console.error('Ошибка экспорта:', error)
      statusModel.showStatus('error', 'Ошибка при экспорте данных')
    }
  }, [statusModel])

  const importData = useCallback(
    async (file: File) => {
      try {
        statusModel.showStatus('info', 'Начните импорт данных...')

        const text = await file.text()
        const importData: ExportData = JSON.parse(text)

        if (!importData.version || !importData.decks || !importData.cards) {
          throw new Error('Неверный формат файла')
        }

        let importedDecks = 0
        let importedCards = 0
        let updatedCards = 0

        for (const deck of importData.decks) {
          try {
            const existingDecks = await db.getDecks()
            const existingDeck = existingDecks.find((d: Deck) => d.id === deck.id)

            if (!existingDeck) {
              // Создаем колоду с оригинальным ID
              await db.createDeckWithId({
                id: deck.id,
                name: deck.name,
                description: deck.description,
                createdAt: new Date(deck.createdAt),
                updatedAt: new Date(deck.updatedAt),
              })
              importedDecks++
            } else {
              // Обновляем существующую колоду если импорт новее
              const importDate = new Date(deck.updatedAt || 0)
              const existingDate = new Date(existingDeck.updatedAt || 0)
              
              if (importDate > existingDate) {
                await db.updateDeck(deck.id, {
                  name: deck.name,
                  description: deck.description,
                  updatedAt: new Date(deck.updatedAt),
                })
              }
            }
          } catch (error) {
            console.warn(`Ошибка импорта колоды ${deck.name}:`, error)
          }
        }

        for (const card of importData.cards) {
          try {
            const existingCards = await db.getCardsByDeck(card.deckId)
            const existingCard = existingCards.find(c => c.id === card.id)

            if (existingCard) {
              const importDate = new Date(card.updatedAt || 0)
              const existingDate = new Date(existingCard.updatedAt || 0)

              if (importDate > existingDate) {
                await db.updateCardFields(card.id, {
                  front: card.front,
                  back: card.back,
                  easeFactor: card.easeFactor,
                  interval: card.interval,
                  repetitions: card.repetitions,
                  isNew: card.isNew,
                  nextReviewDate: card.nextReviewDate,
                  updatedAt: card.updatedAt,
                })
                updatedCards++
              }
            } else {
              // Создаем карточку с оригинальным ID
              const newCard: MnemozaCard = {
                id: card.id,
                deckId: card.deckId,
                front: card.front,
                back: card.back,
                easeFactor: card.easeFactor,
                interval: card.interval,
                repetitions: card.repetitions,
                isNew: card.isNew,
                nextReviewDate: new Date(card.nextReviewDate),
                createdAt: new Date(card.createdAt || new Date()),
                updatedAt: new Date(card.updatedAt || new Date()),
              }
              
              await db.createCardWithId(newCard)
              importedCards++
            }
          } catch (error) {
            console.warn(`Ошибка импорта карточки ${card.front}:`, error)
          }
        }

        statusModel.showStatus(
          'success',
          `Импорт завершен: ${importedDecks} новых колод, ${importedCards} новых карточек, ${updatedCards} обновлено`
        )

        onDataImported?.()
      } catch (error) {
        console.error('Ошибка импорта:', error)
        statusModel.showStatus('error', 'Ошибка при импорте данных. Проверьте формат файла.')
      }
    },
    [statusModel, onDataImported]
  )

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (file) {
        if (file.type === 'application/json' || file.name.endsWith('.json')) {
          importData(file)
        } else {
          statusModel.showStatus('error', 'Пожалуйста, выберите JSON файл')
        }
      }
      event.target.value = ''
    },
    [importData, statusModel]
  )

  return {
    isExporting: false,
    isImporting: false,
    exportAllData,
    importData,
    handleFileUpload,
    statusModel,
  }
}
