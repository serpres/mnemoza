import { motion } from 'framer-motion'
import { BookOpen, Plus, TrendingUp, Trash2, Archive } from 'lucide-react'
import React, { useState } from 'react'
import { useDeckModel } from '@/entities/deck'
import type { Deck } from '@/shared/types/card'
import { ConfirmModal } from '@/features/modals/confirm-modal'
import { Modal } from '@/shared/ui/modal'
import { BackupRestore } from '@/features/backup-restore'

interface DeckListProps {
  onSelectDeck: (deck: Deck) => void
  onCreateDeck: () => void
  showBackupRestore?: boolean
  setShowBackupRestore?: (show: boolean) => void
}

export const DeckList: React.FC<DeckListProps> = ({ 
  onSelectDeck, 
  onCreateDeck, 
  showBackupRestore: externalShowBackupRestore,
  setShowBackupRestore: externalSetShowBackupRestore
}) => {
  const deckModel = useDeckModel()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deckToDelete, setDeckToDelete] = useState<Deck | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [internalShowBackupRestore, setInternalShowBackupRestore] = useState(false)
  
  const showBackupRestore = externalShowBackupRestore ?? internalShowBackupRestore
  const setShowBackupRestore = externalSetShowBackupRestore ?? setInternalShowBackupRestore

  const handleDeleteDeck = (deck: Deck, e: React.MouseEvent) => {
    e.stopPropagation() // Предотвращаем клик по карточке
    setDeckToDelete(deck)
    setShowDeleteConfirm(true)
  }

  const confirmDeleteDeck = async () => {
    if (!deckToDelete) return

    setIsDeleting(true)
    try {
      await deckModel.deleteDeck(deckToDelete.id)
      setShowDeleteConfirm(false)
      setDeckToDelete(null)
    } catch (error) {
      console.error('Ошибка удаления колоды:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const cancelDeleteDeck = () => {
    setShowDeleteConfirm(false)
    setDeckToDelete(null)
  }

  if (deckModel.loading) {
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
      className='max-w-full sm:max-w-2xl lg:max-w-4xl mx-auto p-2 sm:p-4 lg:p-6'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header with gradient background */}
      <div className='bg-white border-b border-gray-200 p-4 mb-6 md:rounded-2xl md:bg-gradient-to-br md:from-blue-600 md:via-purple-600 md:to-blue-800 md:text-white md:p-6'>
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
          <div>
            <h1 className='text-2xl sm:text-3xl md:text-4xl font-bold mb-2 text-gray-900 md:text-white'>Мои колоды</h1>
            <p className='text-gray-600 md:text-blue-100 md:opacity-90'>
              Изучайте эффективно с системой интервальных повторений
            </p>
          </div>
          <div className='flex gap-3'>
            <motion.button
              onClick={() => setShowBackupRestore(true)}
              className='bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-xl transition-all duration-200 font-medium flex items-center gap-2 border border-gray-200 cursor-pointer md:bg-white/20 md:backdrop-blur-sm md:hover:bg-white/30 md:text-white md:border-white/30'
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Archive size={20} />
              <span className='hidden sm:inline'>Резервные копии</span>
            </motion.button>
            <motion.button
              onClick={onCreateDeck}
              className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-all duration-200 font-medium flex items-center gap-2 cursor-pointer md:bg-white/20 md:backdrop-blur-sm md:hover:bg-white/30 md:border md:border-white/30'
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus size={20} />
              Создать колоду
            </motion.button>
          </div>
        </div>
      </div>

      {deckModel.decks.length === 0 ? (
        <motion.div
          className='text-center py-16'
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className='bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-12 max-w-lg mx-auto'>
            <BookOpen size={64} className='text-blue-400 mx-auto mb-6' />
            <h2 className='text-2xl font-bold text-gray-800 mb-3'>Начните изучение</h2>
            <p className='text-gray-600 mb-8 leading-relaxed'>
              Создайте свою первую колоду карточек и откройте для себя эффективное запоминание с
              помощью научно обоснованных методов повторения.
            </p>
            <motion.button
              onClick={onCreateDeck}
              className='bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-xl transition-all duration-200 font-medium flex items-center gap-3 mx-auto cursor-pointer'
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus size={24} />
              Создать первую колоду
            </motion.button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {deckModel.decks.map((deck, index) => {
            const stats = deckModel.deckStats[deck.id] || { total: 0, new: 0, due: 0 }
            return (
              <motion.div
                key={deck.id}
                onClick={() => onSelectDeck(deck)}
                className='bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-300 cursor-pointer hover:border-blue-200 group'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <div className='flex items-start justify-between mb-4'>
                  <BookOpen
                    size={24}
                    className='text-blue-500 group-hover:text-blue-600 transition-colors'
                  />
                  <div className='flex items-center gap-2'>
                    {(stats.new > 0 || stats.due > 0) && (
                      <div className='bg-gradient-to-r from-orange-400 to-red-500 text-white text-xs px-2 py-1 rounded-full'>
                        {stats.new + stats.due}
                      </div>
                    )}
                    <motion.button
                      onClick={(e) => handleDeleteDeck(deck, e)}
                      className='opacity-100 md:opacity-0 md:group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer'
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Trash2 size={16} />
                    </motion.button>
                  </div>
                </div>

                <h3 className='text-xl font-bold text-gray-900 mb-2 truncate group-hover:text-blue-700 transition-colors'>
                  {deck.name}
                </h3>

                {deck.description && (
                  <p className='text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed'>
                    {deck.description}
                  </p>
                )}

                <div className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <span className='text-gray-500 text-sm flex items-center gap-2'>
                      <TrendingUp size={16} />
                      Всего карточек
                    </span>
                    <span className='font-bold text-gray-900 text-lg'>{stats.total}</span>
                  </div>

                  <div className='grid grid-cols-3 gap-2'>
                    {stats.new > 0 && (
                      <div className='bg-blue-50 rounded-lg p-2 text-center'>
                        <div className='font-bold text-blue-600'>{stats.new}</div>
                        <div className='text-xs text-blue-500'>новые</div>
                      </div>
                    )}

                    {stats.due > 0 && (
                      <div className='bg-red-50 rounded-lg p-2 text-center'>
                        <div className='font-bold text-red-600'>{stats.due}</div>
                        <div className='text-xs text-red-500'>повтор</div>
                      </div>
                    )}

                    {stats.due === 0 && stats.new === 0 && stats.total > 0 && (
                      <div className='bg-green-50 rounded-lg p-2 text-center col-span-3'>
                        <div className='text-green-600 text-sm font-medium'>✓ Все изучено</div>
                      </div>
                    )}
                  </div>
                </div>

                <div className='mt-4 pt-4 border-t border-gray-50'>
                  <div className='text-xs text-gray-400'>
                    {new Date(deck.createdAt).toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      )}

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={cancelDeleteDeck}
        onConfirm={confirmDeleteDeck}
        title="Удалить колоду"
        message={`Вы уверены, что хотите удалить колоду "${deckToDelete?.name}"? Все карточки в этой колоде также будут удалены. Это действие нельзя отменить.`}
        confirmText="Удалить"
        cancelText="Отмена"
        loading={isDeleting}
        variant="danger"
      />

      <Modal
        isOpen={showBackupRestore}
        onClose={() => setShowBackupRestore(false)}
        size="lg"
        showCloseButton={true}
      >
        <BackupRestore 
          onDataImported={() => deckModel.loadDecks()} 
          hasData={deckModel.decks.length > 0}
        />
      </Modal>
    </motion.div>
  )
}
