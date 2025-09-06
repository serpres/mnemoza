import React from 'react'
import { useDeckModel } from '@/entities/deck'
import { useCreateDeckFormModel } from '@/entities/deck/add-desk-form'
import { Modal } from '@/shared/ui/modal'

interface CreateDeckModalProps {
  isOpen: boolean
  onClose: () => void
  onDeckCreated: () => void
}

export const CreateDeckModal: React.FC<CreateDeckModalProps> = ({
  isOpen,
  onClose,
  onDeckCreated,
}) => {
  const deckModel = useDeckModel()
  const formModel = useCreateDeckFormModel()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formModel.name.trim()) {
      formModel.setError('Название колоды обязательно')
      return
    }

    formModel.setLoading(true)
    formModel.setError('')

    try {
      await deckModel.createDeck(formModel.name.trim(), formModel.description.trim() || undefined)
      formModel.resetForm()
      onDeckCreated()
      onClose()
    } catch (err) {
      console.error('Ошибка создания колоды:', err)
      formModel.setError('Ошибка при создании колоды')
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
      title="Создать новую колоду"
      size="md"
      closeOnBackdropClick={!formModel.loading}
    >
      <form onSubmit={handleSubmit} className='space-y-6'>
              <div>
                <label
                  htmlFor='deck-name'
                  className='block text-sm font-semibold text-gray-700 mb-3'
                >
                  Название колоды *
                </label>
                <input
                  id='deck-name'
                  type='text'
                  value={formModel.name}
                  onChange={e => formModel.setName(e.target.value)}
                  placeholder='Например: Английские слова'
                  className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white'
                  disabled={formModel.loading}
                  maxLength={100}
                />
              </div>

              <div>
                <label
                  htmlFor='deck-description'
                  className='block text-sm font-semibold text-gray-700 mb-3'
                >
                  Описание (необязательно)
                </label>
                <textarea
                  id='deck-description'
                  value={formModel.description}
                  onChange={e => formModel.setDescription(e.target.value)}
                  placeholder='Краткое описание колоды'
                  rows={3}
                  className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none bg-gray-50 focus:bg-white'
                  disabled={formModel.loading}
                  maxLength={500}
                />
              </div>

              {formModel.error && (
                <div className='text-red-600 text-sm bg-red-50 p-4 rounded-xl border border-red-200'>
                  {formModel.error}
                </div>
              )}

              <div className='flex gap-3 pt-2'>
                <button
                  type='button'
                  onClick={handleClose}
                  disabled={formModel.loading}
                  className='flex-1 px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50 font-medium'
                >
                  Отмена
                </button>
                <button
                  type='submit'
                  disabled={formModel.loading || !formModel.name.trim()}
                  className='flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium'
                >
                  {formModel.loading ? (
                    <div className='flex items-center justify-center'>
                      <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                      Создание...
                    </div>
                  ) : (
                    'Создать'
                  )}
                </button>
              </div>
      </form>
    </Modal>
  )
}
