import { useStudySessionModel, studyUtils } from '@/features/study-session'
import type { ReviewResult } from '@/shared/types/card'

export interface StudyModel {
  studySessionModel: ReturnType<typeof useStudySessionModel>
  handleReviewWithResult: (result: ReviewResult, onSessionComplete: () => void) => Promise<void>
  formatTime: (date: Date) => string
}

export const useStudyModel = (deckId: string): StudyModel => {
  const studySessionModel = useStudySessionModel(deckId)

  const handleReviewWithResult = async (result: ReviewResult, onSessionComplete: () => void) => {
    const reviewResult = await studySessionModel.handleReview(result)
    if (reviewResult?.sessionCompleted) {
      onSessionComplete()
    }
  }

  const formatTime = studyUtils.formatTime

  return {
    studySessionModel,
    handleReviewWithResult,
    formatTime,
  }
}
