import { motion } from 'framer-motion'
import { AlertCircle, CheckCircle, Download, FileJson, Upload, XCircle } from 'lucide-react'
import React from 'react'
import { useDataManagementModel } from '../model'

interface BackupRestoreProps {
  onDataImported?: () => void
  hasData?: boolean
}

export const BackupRestore: React.FC<BackupRestoreProps> = ({ onDataImported, hasData = true }) => {
  const dataManagerModel = useDataManagementModel(onDataImported)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        dataManagerModel.importData(file)
      } else {
        dataManagerModel.statusModel.showStatus('error', 'Пожалуйста, выберите JSON файл')
      }
    }
    // Сбрасываем значение input для возможности загрузки того же файла повторно
    event.target.value = ''
  }

  return (
    <motion.div
      className='bg-white rounded-2xl border border-gray-100 p-6 space-y-6'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div className='text-center'>
        <h3 className='text-lg font-semibold text-gray-900 mb-2'>Резервное копирование</h3>
        <p className='text-sm text-gray-600'>
          Создайте резервную копию или восстановите все колоды и карточки
        </p>
      </div>

      {/* Status Message */}
      {dataManagerModel.statusModel.status.type && (
        <motion.div
          className={`p-3 rounded-lg flex items-center gap-2 ${
            dataManagerModel.statusModel.status.type === 'success'
              ? 'bg-green-50 text-green-700'
              : dataManagerModel.statusModel.status.type === 'error'
                ? 'bg-red-50 text-red-700'
                : 'bg-blue-50 text-blue-700'
          }`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {dataManagerModel.statusModel.status.type === 'success' && <CheckCircle size={16} />}
          {dataManagerModel.statusModel.status.type === 'error' && <XCircle size={16} />}
          {dataManagerModel.statusModel.status.type === 'info' && <AlertCircle size={16} />}
          <span className='text-sm'>{dataManagerModel.statusModel.status.message}</span>
        </motion.div>
      )}

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        {/* Export Button */}
        <motion.button
          onClick={dataManagerModel.exportAllData}
          disabled={dataManagerModel.isExporting || !hasData}
          className='flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'
          whileHover={!dataManagerModel.isExporting && hasData ? { scale: 1.02 } : {}}
          whileTap={!dataManagerModel.isExporting && hasData ? { scale: 0.98 } : {}}
        >
          <Download
            size={24}
            className={`mb-2 ${dataManagerModel.isExporting ? 'text-gray-400' : 'text-blue-500'}`}
          />
          <span className='font-medium text-gray-900 mb-1'>
            {dataManagerModel.isExporting ? 'Создание копии...' : !hasData ? 'Нет данных для копии' : 'Создать резервную копию'}
          </span>
          <span className='text-xs text-gray-500 text-center'>
            {!hasData ? 'Создайте колоды и карточки для резервного копирования' : 'Сохранить все колоды и карточки в файл'}
          </span>
        </motion.button>

        {/* Import Button */}
        <motion.label
          className='flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition-colors cursor-pointer'
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <input
            type='file'
            accept='.json,application/json'
            onChange={handleFileUpload}
            disabled={dataManagerModel.isImporting}
            className='hidden'
          />
          <Upload
            size={24}
            className={`mb-2 ${dataManagerModel.isImporting ? 'text-gray-400' : 'text-green-500'}`}
          />
          <span className='font-medium text-gray-900 mb-1'>
            {dataManagerModel.isImporting ? 'Восстановление...' : 'Восстановить из копии'}
          </span>
          <span className='text-xs text-gray-500 text-center'>
            Восстановить колоды и карточки из файла резервной копии
          </span>
        </motion.label>
      </div>

      {/* Format Info */}
      <div className='bg-gray-50 rounded-lg p-4'>
        <div className='flex items-start gap-2'>
          <FileJson size={16} className='text-gray-400 mt-0.5' />
          <div className='text-xs text-gray-600'>
            <p className='font-medium mb-1'>Формат файла:</p>
            <ul className='space-y-1'>
              <li>• Файл резервной копии со всеми данными</li>
              <li>• Включает колоды, карточки и прогресс изучения</li>
              <li>• При восстановлении новые данные добавляются, существующие обновляются</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
