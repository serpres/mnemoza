import { AlertTriangle } from 'lucide-react'
import React from 'react'
import { Modal } from '@/shared/ui/modal'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  loading?: boolean
  variant?: 'danger' | 'warning' | 'info'
}

const variantStyles = {
  danger: {
    icon: 'text-red-500',
    confirmButton: 'bg-red-500 hover:bg-red-600 text-white',
    iconBg: 'bg-red-100',
  },
  warning: {
    icon: 'text-orange-500',
    confirmButton: 'bg-orange-500 hover:bg-orange-600 text-white',
    iconBg: 'bg-orange-100',
  },
  info: {
    icon: 'text-blue-500',
    confirmButton: 'bg-blue-500 hover:bg-blue-600 text-white',
    iconBg: 'bg-blue-100',
  },
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Подтвердить',
  cancelText = 'Отмена',
  loading = false,
  variant = 'danger',
}) => {
  const styles = variantStyles[variant]

  const handleConfirm = () => {
    if (!loading) {
      onConfirm()
    }
  }

  const handleClose = () => {
    if (!loading) {
      onClose()
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="sm"
      closeOnBackdropClick={!loading}
      showCloseButton={true}
    >
      <div className="text-center">
        <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${styles.iconBg} mb-4`}>
          <AlertTriangle className={`h-6 w-6 ${styles.icon}`} />
        </div>

        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {title}
        </h3>

        <p className="text-sm text-gray-500 mb-6">
          {message}
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 font-medium cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className={`flex-1 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium cursor-pointer ${styles.confirmButton}`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Удаление...
              </div>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </Modal>
  )
}
