import { motion } from 'framer-motion'
import { ArrowLeft, Check, Clock, Target, TrendingUp } from 'lucide-react'
import React from 'react'
import { useStudyModel } from '@/entities/study'
import { MnemozaAlgorithm } from '@/shared/mnemoza-algorithm'
import type { Deck } from '@/shared/types/card'
import { ReviewResult as ReviewResultValues } from '@/shared/types/card'

interface StudySessionProps {
  deck: Deck
  onBack: () => void
}

export const StudySession: React.FC<StudySessionProps> = ({ deck, onBack }) => {
  const studyModel = useStudyModel(deck.id)

  const handleReviewWithResult = async (
    result:
      | typeof ReviewResultValues.AGAIN
      | typeof ReviewResultValues.HARD
      | typeof ReviewResultValues.GOOD
      | typeof ReviewResultValues.EASY
  ) => {
    await studyModel.handleReviewWithResult(result, onBack)
  }

  if (studyModel.studySessionModel.loading) {
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

  if (!studyModel.studySessionModel.hasCards) {
    return (
    <motion.div
      className='max-w-full sm:max-w-2xl lg:max-w-4xl mx-auto p-2 sm:p-3 lg:p-4'
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
        <div className='text-center py-8 sm:py-12'>
          <div className='bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 sm:p-8'>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
            >
              <Check size={60} className='text-green-500 mx-auto mb-4' />
            </motion.div>
            <h2 className='text-xl sm:text-2xl font-bold text-gray-900 mb-3'>Отличная работа!</h2>
            <p className='text-gray-600 mb-6 leading-relaxed text-sm sm:text-base'>
              В колоде "<span className='font-semibold text-gray-800'>{deck.name}</span>" нет
              карточек для изучения. Приходите позже, когда подойдет время повторения.
            </p>
            <motion.button
              onClick={onBack}
              className='bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 mx-auto cursor-pointer text-sm sm:text-base'
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft size={18} />
              Вернуться к колоде
            </motion.button>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className='max-w-full sm:max-w-2xl lg:max-w-4xl mx-auto p-2 sm:p-3 lg:p-4 pb-20 md:pb-4'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className='bg-white border-b border-gray-200 p-4 mb-4 md:rounded-xl md:bg-gradient-to-r md:from-blue-600 md:to-purple-600 md:text-white'>
        <div className='flex items-center justify-between mb-3'>
          <motion.button
            onClick={onBack}
            className='flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer md:text-white/80 md:hover:text-white md:hover:bg-white/20'
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft size={18} />
          </motion.button>

          <div className='text-center'>
            <h1 className='text-lg sm:text-xl font-bold text-gray-900 md:text-white'>{deck.name}</h1>
            <p className='text-gray-600 text-sm md:text-blue-100 md:opacity-90'>
              Карточка {studyModel.studySessionModel.currentCard ? 1 : 0} из {1}
            </p>
          </div>

          <div className='text-right'>
            <div className='flex items-center gap-1 text-gray-600 md:text-blue-100'>
              <Clock size={14} />
              <span className='text-xs font-medium'>
                {studyModel.formatTime(studyModel.studySessionModel.sessionStats.startTime)}
              </span>
            </div>
          </div>
        </div>

        <div className='w-full bg-gray-200 rounded-full h-2 overflow-hidden md:bg-white/20'>
          <motion.div
            className='bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full md:from-yellow-400 md:to-orange-500'
            initial={{ width: 0 }}
            animate={{ width: `${studyModel.studySessionModel.progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      <div className='grid grid-cols-3 gap-2 sm:gap-3 mb-4'>
        <div className='bg-white rounded-lg p-2 sm:p-3 text-center border border-gray-100'>
          <div className='flex items-center justify-center gap-1 mb-1'>
            <Target size={16} className='text-blue-500' />
            <span className='font-bold text-lg sm:text-xl text-gray-900'>
              {studyModel.studySessionModel.sessionStats.cardsStudied}
            </span>
          </div>
          <div className='text-gray-500 text-xs'>Изучено</div>
        </div>
        <div className='bg-white rounded-lg p-2 sm:p-3 text-center border border-gray-100'>
          <div className='flex items-center justify-center gap-1 mb-1'>
            <Check size={16} className='text-green-500' />
            <span className='font-bold text-lg sm:text-xl text-green-600'>
              {studyModel.studySessionModel.sessionStats.correct}
            </span>
          </div>
          <div className='text-gray-500 text-xs'>Правильно</div>
        </div>
        <div className='bg-white rounded-lg p-2 sm:p-3 text-center border border-gray-100'>
          <div className='flex items-center justify-center gap-1 mb-1'>
            <TrendingUp size={16} className='text-red-500' />
            <span className='font-bold text-lg sm:text-xl text-red-600'>
              {studyModel.studySessionModel.sessionStats.cardsStudied -
                studyModel.studySessionModel.sessionStats.correct}
            </span>
          </div>
          <div className='text-gray-500 text-xs'>Ошибок</div>
        </div>
      </div>

      <motion.div
        className='bg-white rounded-xl border border-gray-100 shadow-lg p-4 sm:p-6 mb-4 min-h-[250px] sm:min-h-[300px] flex flex-col justify-center cursor-pointer'
        key={studyModel.studySessionModel.currentCard?.id}
        initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
        animate={{ 
          opacity: 1, 
          scale: 1, 
          rotateY: studyModel.studySessionModel.showAnswer ? 0 : -10
        }}
        transition={{ duration: 0.5, type: "spring" }}
        onClick={!studyModel.studySessionModel.showAnswer ? studyModel.studySessionModel.showCardAnswer : undefined}
      >
        <div className='text-center'>
          {studyModel.studySessionModel.currentCard?.isNew && (
            <motion.div
              className='inline-block bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs sm:text-sm px-3 py-1 rounded-full mb-3 sm:mb-4'
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              ✨ Новая карточка
            </motion.div>
          )}

          <motion.div
            className='text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6 leading-relaxed'
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {studyModel.studySessionModel.currentCard?.front}
          </motion.div>

          {studyModel.studySessionModel.showAnswer && (
            <motion.div
              className='border-t border-gray-200 pt-4 sm:pt-6'
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className='text-base sm:text-lg text-gray-700 leading-relaxed font-medium'>
                {studyModel.studySessionModel.currentCard?.back}
              </div>
            </motion.div>
          )}

          {!studyModel.studySessionModel.showAnswer && (
            <div className='text-xs sm:text-sm text-gray-500 mt-4 sm:mt-6'>
              Нажмите на карточку или кнопку "Показать ответ" чтобы увидеть обратную сторону
            </div>
          )}
        </div>
      </motion.div>

      {/* Action Buttons - Fixed at bottom on mobile */}
      {!studyModel.studySessionModel.showAnswer ? (
        <div className='fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40 md:relative md:border-t-0 md:bg-transparent md:p-0'>
          <div className='text-center'>
            <motion.button
              onClick={studyModel.studySessionModel.showCardAnswer}
              className='bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-bold transition-all text-base sm:text-lg shadow-lg cursor-pointer w-full max-w-sm'
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Показать ответ
            </motion.button>
          </div>
        </div>
      ) : (
        <motion.div
          className='fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40 md:relative md:border-t-0 md:bg-transparent md:p-0'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className='text-center text-gray-600 mb-3 sm:mb-4'>
            <p className='text-sm sm:text-base font-medium'>Насколько хорошо вы помните эту карточку?</p>
            <p className='text-xs opacity-75 mt-1'>
              Время следующего показа зависит от вашего ответа
            </p>
          </div>

          <div className='grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3'>
            <motion.button
              onClick={() => handleReviewWithResult(ReviewResultValues.AGAIN)}
              disabled={studyModel.studySessionModel.studying}
              className={`py-3 px-2 rounded-lg font-bold transition-all text-white disabled:opacity-50 shadow-md ${MnemozaAlgorithm.getButtonColor(ReviewResultValues.AGAIN)}`}
              whileHover={!studyModel.studySessionModel.studying ? { scale: 1.05, y: -2 } : {}}
              whileTap={!studyModel.studySessionModel.studying ? { scale: 0.95 } : {}}
            >
              <div className='text-xs sm:text-sm'>Забыл</div>
              <div className='text-xs opacity-90 mt-1'>
                {studyModel.studySessionModel.currentCard
                  ? MnemozaAlgorithm.getButtonIntervalText(
                      studyModel.studySessionModel.currentCard,
                      ReviewResultValues.AGAIN
                    )
                  : '1м'}
              </div>
            </motion.button>

            <motion.button
              onClick={() => handleReviewWithResult(ReviewResultValues.HARD)}
              disabled={studyModel.studySessionModel.studying}
              className={`py-3 px-2 rounded-lg font-bold transition-all text-white disabled:opacity-50 shadow-md ${MnemozaAlgorithm.getButtonColor(ReviewResultValues.HARD)}`}
              whileHover={!studyModel.studySessionModel.studying ? { scale: 1.05, y: -2 } : {}}
              whileTap={!studyModel.studySessionModel.studying ? { scale: 0.95 } : {}}
            >
              <div className='text-xs sm:text-sm'>Сложно</div>
              <div className='text-xs opacity-90 mt-1'>
                {studyModel.studySessionModel.currentCard
                  ? MnemozaAlgorithm.getButtonIntervalText(
                      studyModel.studySessionModel.currentCard,
                      ReviewResultValues.HARD
                    )
                  : '10м'}
              </div>
            </motion.button>

            <motion.button
              onClick={() => handleReviewWithResult(ReviewResultValues.GOOD)}
              disabled={studyModel.studySessionModel.studying}
              className={`py-3 px-2 rounded-lg font-bold transition-all text-white disabled:opacity-50 shadow-md ${MnemozaAlgorithm.getButtonColor(ReviewResultValues.GOOD)}`}
              whileHover={!studyModel.studySessionModel.studying ? { scale: 1.05, y: -2 } : {}}
              whileTap={!studyModel.studySessionModel.studying ? { scale: 0.95 } : {}}
            >
              <div className='text-xs sm:text-sm'>Нормально</div>
              <div className='text-xs opacity-90 mt-1'>
                {studyModel.studySessionModel.currentCard
                  ? MnemozaAlgorithm.getButtonIntervalText(
                      studyModel.studySessionModel.currentCard,
                      ReviewResultValues.GOOD
                    )
                  : '1 день'}
              </div>
            </motion.button>

            <motion.button
              onClick={() => handleReviewWithResult(ReviewResultValues.EASY)}
              disabled={studyModel.studySessionModel.studying}
              className={`py-3 px-2 rounded-lg font-bold transition-all text-white disabled:opacity-50 shadow-md ${MnemozaAlgorithm.getButtonColor(ReviewResultValues.EASY)}`}
              whileHover={!studyModel.studySessionModel.studying ? { scale: 1.05, y: -2 } : {}}
              whileTap={!studyModel.studySessionModel.studying ? { scale: 0.95 } : {}}
            >
              <div className='text-xs sm:text-sm'>Легко</div>
              <div className='text-xs opacity-90 mt-1'>
                {studyModel.studySessionModel.currentCard
                  ? MnemozaAlgorithm.getButtonIntervalText(
                      studyModel.studySessionModel.currentCard,
                      ReviewResultValues.EASY
                    )
                  : '4 дня'}
              </div>
            </motion.button>
          </div>

          {studyModel.studySessionModel.studying && (
            <motion.div
              className='text-center text-gray-500 flex items-center justify-center gap-2 mt-3'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div
                className='rounded-full h-3 w-3 border-b-2 border-blue-500'
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
              <span className='text-xs sm:text-sm'>Обновление карточки...</span>
            </motion.div>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}
