import { AnimatePresence, motion } from 'framer-motion'
import { Download, Wifi, WifiOff, X } from 'lucide-react'
import React from 'react'
import { usePWAModel } from '@/shared/pwa'

export const PWAPrompt: React.FC = () => {
  const pwaModel = usePWAModel()

  if (pwaModel.isInstalled || sessionStorage.getItem('pwa-install-dismissed')) {
    return (
      <AnimatePresence>
        {pwaModel.showOfflineNotice && (
          <motion.div
            className='fixed top-4 left-4 right-4 bg-orange-500 text-white px-4 py-3 rounded-xl shadow-lg z-50 flex items-center gap-3'
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
          >
            <WifiOff size={20} />
            <span className='flex-1'>Режим оффлайн - приложение продолжает работать!</span>
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

  return (
    <AnimatePresence>
      {/* Уведомление об оффлайн режиме */}
      {pwaModel.showOfflineNotice && (
        <motion.div
          className='fixed top-4 left-4 right-4 bg-orange-500 text-white px-4 py-3 rounded-xl shadow-lg z-50 flex items-center gap-3'
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
        >
          <WifiOff size={20} />
          <span className='flex-1'>Режим оффлайн - приложение продолжает работать!</span>
        </motion.div>
      )}

      {/* Подсказка установки */}
      {pwaModel.showInstallPrompt && pwaModel.installPrompt && (
        <motion.div
          className='fixed bottom-4 left-4 right-4 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden'
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
        >
          <div className='bg-gradient-to-r from-blue-500 to-purple-600 p-4'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <Download size={24} className='text-white' />
                <div>
                  <h3 className='text-white font-bold'>Установить Mnemoza</h3>
                  <p className='text-blue-100 text-sm'>Быстрый доступ + работа оффлайн</p>
                </div>
              </div>
              <button
                onClick={pwaModel.dismissInstallPrompt}
                className='text-white/80 hover:text-white'
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className='p-4'>
            <div className='flex items-center gap-2 mb-3'>
              <Wifi size={16} className='text-green-500' />
              <span className='text-sm text-gray-600'>Полная работа без интернета</span>
            </div>
            
            {pwaModel.isIOS && (
              <div className='bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3'>
                <p className='text-sm text-blue-800'>
                  <strong>Для iPhone:</strong> Нажмите кнопку "Поделиться" внизу экрана, затем выберите "На экран Домой"
                </p>
              </div>
            )}

            <div className='flex gap-3'>
              <button
                onClick={pwaModel.dismissInstallPrompt}
                className='flex-1 px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors'
              >
                Позже
              </button>
              <button
                onClick={pwaModel.handleInstall}
                className='flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium'
              >
                Установить
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
