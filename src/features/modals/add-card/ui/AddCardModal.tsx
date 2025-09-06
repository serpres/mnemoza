import React from 'react'
import { useCardModel } from '@/entities/card'
import { useAddCardFormModel } from '@/entities/deck/add-desk-form'
import { Modal } from '@/shared/ui/modal'

interface AddCardModalProps { 
  isOpen: boolean
  onClose: () => void
  deckId: string
  onCardAdded: () => void
}

export const AddCardModal: React.FC<AddCardModalProps> = ({
  isOpen,
  onClose,
  deckId,
  onCardAdded,
}) => {
  const cardModel = useCardModel(deckId)
  const formModel = useAddCardFormModel()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formModel.front.trim() || !formModel.back.trim()) {
      formModel.setError('Оба поля должны быть заполнены')
      return
    }

    formModel.setLoading(true)
    formModel.setError('')

    try {
      await cardModel.createCard(formModel.front.trim(), formModel.back.trim())
      formModel.resetForm()
      onCardAdded()
      onClose()
    } catch (err) {
      console.error('Ошибка создания карточки:', err)
      formModel.setError('Ошибка при создании карточки')
    } finally {
      formModel.setLoading(false)
    }
  }

  const handleClose = () => {
    if (!formModel.loading) {
      formModel.resetForm()
      onClose()
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Добавить карточку"
      size="lg"
      closeOnBackdropClick={!formModel.loading}
    >
      <form onSubmit={handleSubmit} className='space-y-6'>
          <div>
            <label htmlFor='card-front' className='block text-sm font-medium text-gray-700 mb-2'>
              Лицевая сторона (вопрос) *
            </label>
            <textarea
              id='card-front'
              value={formModel.front}
              onChange={e => formModel.setFront(e.target.value)}
              placeholder="Например: Что означает слово 'apple'?"
              rows={3}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none'
              disabled={formModel.loading}
              maxLength={1000}
            />
            <div className='text-xs text-gray-500 mt-1'>
              {formModel.front.length}/1000 символов
            </div>
          </div>

          <div>
            <label htmlFor='card-back' className='block text-sm font-medium text-gray-700 mb-2'>
              Обратная сторона (ответ) *
            </label>
            <textarea
              id='card-back'
              value={formModel.back}
              onChange={e => formModel.setBack(e.target.value)}
              placeholder='Например: Яблоко'
              rows={3}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none'
              disabled={formModel.loading}
              maxLength={1000}
            />
            <div className='text-xs text-gray-500 mt-1'>
              {formModel.back.length}/1000 символов
            </div>
          </div>

          {formModel.error && (
            <div className='text-red-600 text-sm bg-red-50 p-3 rounded-lg'>
              {formModel.error}
            </div>
          )}

          <div className='bg-blue-50 p-4 rounded-lg'>
            <h3 className='text-sm font-medium text-blue-900 mb-2'>
              💡 Советы для создания карточек:
            </h3>
            <ul className='text-sm text-blue-800 space-y-1'>
              <li>• Делайте вопросы конкретными и однозначными</li>
              <li>• Избегайте слишком сложных или составных вопросов</li>
              <li>• Используйте примеры и контекст для лучшего запоминания</li>
            </ul>
          </div>

          <div className='flex gap-3 pt-4'>
            <button
              type='button'
              onClick={handleClose}
              disabled={formModel.loading}
              className='flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50'
            >
              Отмена
            </button>
            <button
              type='submit'
              disabled={
                formModel.loading ||
                !formModel.front.trim() ||
                !formModel.back.trim()
              }
              className='flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {formModel.loading ? (
                <div className='flex items-center justify-center'>
                  <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                  Создание...
                </div>
              ) : (
                'Добавить карточку'
              )}
            </button>
          </div>
        </form>
    </Modal>
  )
}
