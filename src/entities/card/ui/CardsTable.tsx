import { motion } from 'framer-motion'
import { Calendar, RotateCcw, Search, Star, Trash2 } from 'lucide-react'
import React, { useMemo } from 'react'
import { useTableModel } from '@/entities/table'
import type { MnemozaCard } from '../../../shared/types/card'

interface CardsTableProps {
  cards: MnemozaCard[]
  onDeleteCard: (cardId: string) => void
}

export const CardsTable: React.FC<CardsTableProps> = ({ cards, onDeleteCard }) => {
  const tableModel = useTableModel()

  const filteredCards = useMemo(() => {
    return cards.filter(
      card =>
        card.front.toLowerCase().includes(tableModel.searchTerm.toLowerCase()) ||
        card.back.toLowerCase().includes(tableModel.searchTerm.toLowerCase())
    )
  }, [cards, tableModel.searchTerm])

  const visibleCards = filteredCards.slice(0, tableModel.visibleCount)
  const hasMore = tableModel.visibleCount < filteredCards.length

  const getCardStatus = (card: MnemozaCard) => {
    if (card.isNew) {
      return {
        icon: <Star size={12} />,
        text: 'Новая',
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-800',
      }
    }

    const isDue = card.nextReviewDate <= new Date()
    if (isDue) {
      return {
        icon: <RotateCcw size={12} />,
        text: 'К повторению',
        bgColor: 'bg-red-100',
        textColor: 'text-red-800',
      }
    }

    return {
      icon: '✓',
      text: 'Изучена',
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
    }
  }

  const getNextReviewText = (date: Date) => {
    const now = new Date()
    const diffMs = date.getTime() - now.getTime()
    const diffMinutes = Math.ceil(diffMs / (1000 * 60))
    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60))
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

    if (diffMs <= 0) return 'Сейчас'
    if (diffMinutes <= 60) return `${diffMinutes}м`
    if (diffHours <= 24) return `${diffHours}ч`
    if (diffDays === 1) return 'Завтра'
    return `${diffDays} дн.`
  }

  return (
    <motion.div
      className='bg-white rounded-2xl border border-gray-100 overflow-hidden'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      {/* Search */}
      <div className='p-4 border-b border-gray-100'>
        <div className='relative'>
          <Search
            size={20}
            className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
          />
          <input
            type='text'
            placeholder='Поиск по карточкам...'
            value={tableModel.searchTerm}
            onChange={e => tableModel.setSearchTerm(e.target.value)}
            className='w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white'
          />
        </div>
      </div>

      {/* Results count */}
      {tableModel.searchTerm && (
        <div className='px-4 py-2 bg-blue-50 border-b border-gray-100'>
          <span className='text-sm text-blue-700'>
            Найдено {filteredCards.length} из {cards.length} карточек
          </span>
        </div>
      )}

      {/* Cards List */}
      <div className='divide-y divide-gray-100'>
        {visibleCards.length === 0 ? (
          <div className='p-8 text-center text-gray-500'>
            {tableModel.searchTerm ? 'Карточки не найдены' : 'Карточек пока нет'}
          </div>
        ) : (
          visibleCards.map((card, index) => {
            const status = getCardStatus(card)
            const nextReviewText = getNextReviewText(card.nextReviewDate)
            const diffMs = card.nextReviewDate.getTime() - new Date().getTime()

            return (
              <motion.div
                key={card.id}
                className='p-4 hover:bg-gray-50 transition-colors'
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
                  {/* Card Content */}
                  <div className='flex-1 min-w-0 space-y-2'>
                    <div className='flex items-start justify-between gap-3'>
                      <div className='flex-1 min-w-0'>
                        <h4 className='font-medium text-gray-900 truncate'>{card.front}</h4>
                        <p className='text-sm text-gray-600 mt-1 line-clamp-2'>{card.back}</p>
                      </div>

                      {/* Status Badge */}
                      <span
                        className={`inline-flex items-center gap-1 ${status.bgColor} ${status.textColor} text-xs px-2 py-1 rounded-full whitespace-nowrap`}
                      >
                        {status.icon}
                        {status.text}
                      </span>
                    </div>

                    {/* Stats */}
                    <div className='flex items-center gap-4 text-xs text-gray-500'>
                      <span className='flex items-center gap-1'>
                        <RotateCcw size={12} />
                        {card.repetitions} повторений
                      </span>
                      <span className='flex items-center gap-1'>
                        <Calendar size={12} />
                        <span className={diffMs <= 0 ? 'text-red-600 font-medium' : ''}>
                          {nextReviewText}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className='flex items-center justify-end'>
                    <motion.button
                      onClick={() => onDeleteCard(card.id)}
                      className='text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors cursor-pointer'
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Trash2 size={16} />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )
          })
        )}
      </div>

      {/* Show More Button */}
      {hasMore && (
        <div className='p-4 border-t border-gray-100'>
          <motion.button
            onClick={tableModel.showMore}
            className='w-full py-3 bg-blue-50 text-blue-600 font-medium rounded-xl hover:bg-blue-100 transition-colors cursor-pointer'
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Показать ещё карточки ({Math.min(10, filteredCards.length - tableModel.visibleCount)})
          </motion.button>
        </div>
      )}

      {/* Total count */}
      {visibleCards.length > 0 && (
        <div className='px-4 py-3 bg-gray-50 text-center text-sm text-gray-600'>
          Показано {visibleCards.length} из {filteredCards.length} карточек
        </div>
      )}
    </motion.div>
  )
}
