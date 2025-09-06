import { useCallback, useState } from 'react'

export interface StatusModel extends StatusState, StatusActions {}

export interface StatusMessage {
  type: 'success' | 'error' | 'info' | null
  message: string
}

export interface StatusState {
  status: StatusMessage
}

export interface StatusActions {
  showStatus: (type: 'success' | 'error' | 'info', message: string) => void
  clearStatus: () => void
}

export const useAlertModel = (autoHideDelay = 5000): StatusModel => {
  const [status, setStatus] = useState<StatusMessage>({ type: null, message: '' })

  const showStatus = useCallback(
    (type: 'success' | 'error' | 'info', message: string) => {
      setStatus({ type, message })
      if (autoHideDelay > 0) {
        setTimeout(() => setStatus({ type: null, message: '' }), autoHideDelay)
      }
    },
    [autoHideDelay]
  )

  const clearStatus = useCallback(() => {
    setStatus({ type: null, message: '' })
  }, [])

  return {
    status,
    showStatus,
    clearStatus,
  }
}