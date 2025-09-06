import { motion } from 'framer-motion'
import { ArrowLeft, BarChart3, FileText, Play, Plus } from 'lucide-react'
import React, { useState } from 'react'
import { useCardModel } from '@/entities/card'
import type { Deck } from '@/shared/types/card'
import { AddCardModal } from '@/features/modals/add-card'
import { CardsTable } from '@/entities/card/ui'
import { ConfirmModal } from '@/features/modals/confirm-modal'

interface DeckViewProps {
  deck: Deck
  onBack: () => void
  onStartStudy: (deck: Deck) => void
}

export const DeckView: React.FC<DeckViewProps> = ({ deck, onBack, onStartStudy }) => {
  const cardModel = useCardModel(deck.id)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [cardToDelete, setCardToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleCardAdded = () => {
    setShowAddModal(false)
  }

  const handleDeleteCard = (cardId: string) => {
    setCardToDelete(cardId)
    setShowDeleteConfirm(true)
  }

  const confirmDeleteCard = async () => {
    if (!cardToDelete) return

    setIsDeleting(true)
    try {
      await cardModel.deleteCard(cardToDelete)
      setShowDeleteConfirm(false)
      setCardToDelete(null)
    } catch (error) {
      console.error('Ошибка удаления карточки:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const cancelDeleteCard = () => {
    setShowDeleteConfirm(false)
    setCardToDelete(null)
  }

  const canStudy = cardModel.stats.new > 0 || cardModel.stats.due > 0

  if (cardModel.loading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <motion.div
          className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500'
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    )
  }

  return (
    <motion.div
      className='max-w-full sm:max-w-5xl lg:max-w-7xl mx-auto p-2 sm:p-4 lg:p-6'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className='bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-800 rounded-2xl p-6 mb-4 text-white'>
        <div className='flex items-center gap-2'>
          <motion.button
            onClick={onBack}
            className='flex items-center justify-center w-10 h-10 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-colors cursor-pointer'
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft size={24} />
          </motion.button>
          <div className='flex-1'>
            <h1 className='text-3xl sm:text-4xl font-bold'>{deck.name}</h1>
            {deck.description && (
              <p className='text-indigo-100 opacity-90 mt-2 text-lg'>{deck.description}</p>
            )}
          </div>
        </div>
      </div>

      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-8'>
        <motion.div
          className='bg-white rounded-xl p-6 border border-gray-100 shadow-sm'
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className='flex items-center gap-3 mb-2'>
            <FileText className='text-gray-500' size={24} />
            <span className='text-3xl font-bold text-gray-900'>
              {cardModel.stats.total}
            </span>
          </div>
          <div className='text-sm text-gray-500'>Всего карточек</div>
        </motion.div>

        <motion.div
          className='bg-white rounded-xl p-6 border border-gray-100 shadow-sm'
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className='flex items-center gap-3 mb-2'>
            <div className='w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center'>
              <span className='text-white text-xs font-bold'>N</span>
            </div>
            <span className='text-3xl font-bold text-blue-600'>
              {cardModel.stats.new}
            </span>
          </div>
          <div className='text-sm text-gray-500'>Новые</div>
        </motion.div>

        <motion.div
          className='bg-white rounded-xl p-6 border border-gray-100 shadow-sm'
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className='flex items-center gap-3 mb-2'>
            <div className='w-6 h-6 bg-red-500 rounded-full flex items-center justify-center'>
              <span className='text-white text-xs font-bold'>!</span>
            </div>
            <span className='text-3xl font-bold text-red-600'>{cardModel.stats.due}</span>
          </div>
          <div className='text-sm text-gray-500'>К повторению</div>
        </motion.div>

        <motion.div
          className='bg-white rounded-xl p-6 border border-gray-100 shadow-sm'
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className='flex items-center gap-3 mb-2'>
            <div className='w-6 h-6 bg-green-500 rounded-full flex items-center justify-center'>
              <span className='text-white text-xs font-bold'>✓</span>
            </div>
            <span className='text-3xl font-bold text-green-600'>
              {cardModel.stats.total -
                cardModel.stats.new -
                cardModel.stats.due}
            </span>
          </div>
          <div className='text-sm text-gray-500'>Изучено</div>
        </motion.div>
      </div>

      <div className='flex flex-col sm:flex-row gap-4 mb-8'>
        <motion.button
          onClick={() => onStartStudy(deck)}
          disabled={!canStudy}
          className={`flex-1 py-4 px-8 rounded-xl font-bold transition-all flex items-center justify-center gap-3 text-lg ${
            canStudy
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg cursor-pointer'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
          whileHover={canStudy ? { scale: 1.02 } : {}}
          whileTap={canStudy ? { scale: 0.98 } : {}}
        >
          <Play size={24} />
          {canStudy ? (
            <>
              Начать изучение
              {cardModel.stats.new > 0 && cardModel.stats.due > 0
                ? ` (${cardModel.stats.new + cardModel.stats.due})`
                : cardModel.stats.new > 0
                  ? ` (${cardModel.stats.new} новых)`
                  : ` (${cardModel.stats.due} к повторению)`}
            </>
          ) : (
            'Все карточки изучены'
          )}
        </motion.button>

        <motion.button
          onClick={() => setShowAddModal(true)}
          className='bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-4 px-8 rounded-xl font-bold transition-all flex items-center gap-3 text-lg shadow-lg cursor-pointer'
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus size={24} />
          Добавить карточку
        </motion.button>
      </div>

      {/* Cards Section */}
      {cardModel.cards.length === 0 ? (
        <motion.div
          className='text-center py-16'
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className='bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl p-12 max-w-lg mx-auto'>
            <BarChart3 size={64} className='text-gray-400 mx-auto mb-6' />
            <h2 className='text-2xl font-bold text-gray-800 mb-3'>Пока нет карточек</h2>
            <p className='text-gray-600 mb-8 leading-relaxed'>
              Добавьте первую карточку для изучения и начните эффективное запоминание с помощью
              системы интервальных повторений.
            </p>
            <motion.button
              onClick={() => setShowAddModal(true)}
              className='bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-4 rounded-xl transition-all duration-200 font-bold flex items-center gap-3 mx-auto cursor-pointer'
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus size={24} />
              Добавить первую карточку
            </motion.button>
          </div>
        </motion.div>
      ) : (
        <div className='space-y-6'>
          <div className='flex items-center justify-between'>
            <h2 className='text-2xl font-bold text-gray-900 flex items-center gap-3'>
              <BarChart3 size={28} className='text-blue-500' />
              Карточки ({cardModel.cards.length})
            </h2>
          </div>

          <CardsTable cards={cardModel.cards} onDeleteCard={handleDeleteCard} />
        </div>
      )}

      <AddCardModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        deckId={deck.id}
        onCardAdded={handleCardAdded}
      />

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={cancelDeleteCard}
        onConfirm={confirmDeleteCard}
        title="Удалить карточку"
        message="Вы уверены, что хотите удалить эту карточку? Это действие нельзя отменить."
        confirmText="Удалить"
        cancelText="Отмена"
        loading={isDeleting}
        variant="danger"
      />
    </motion.div>
  )
}
