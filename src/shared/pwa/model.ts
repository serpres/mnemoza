import { useState, useEffect, useCallback } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

interface PWAState {
  isInstalled: boolean
  canInstall: boolean
  showOfflineNotice: boolean
  isOnline: boolean
  showInstallPrompt: boolean
  installPrompt: BeforeInstallPromptEvent | null
}

interface PWAActions {
  installApp: () => Promise<void>
  handleInstall: () => Promise<void>
  dismissInstallPrompt: () => void
}

export interface PWAModel extends PWAState, PWAActions {}

export const usePWAModel = (): PWAModel => {
  const [isInstalled, setIsInstalled] = useState(false)
  const [canInstall, setCanInstall] = useState(false)
  const [showOfflineNotice, setShowOfflineNotice] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    const checkInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true)
      }
    }

    checkInstalled()

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      const promptEvent = e as BeforeInstallPromptEvent
      setInstallPrompt(promptEvent)
      setCanInstall(true)
      setShowInstallPrompt(true)
    }

    const handleOnline = () => {
      setIsOnline(true)
      setShowOfflineNotice(false)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowOfflineNotice(true)
      setTimeout(() => setShowOfflineNotice(false), 5000)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const installApp = useCallback(async () => {
    if (!installPrompt) return

    try {
      await installPrompt.prompt()
      const { outcome } = await installPrompt.userChoice
      
      if (outcome === 'accepted') {
        setIsInstalled(true)
        setCanInstall(false)
        setShowInstallPrompt(false)
      }
      
      setInstallPrompt(null)
    } catch (error) {
      console.error('Ошибка установки PWA:', error)
    }
  }, [installPrompt])

  const handleInstall = useCallback(async () => {
    await installApp()
  }, [installApp])

  const dismissInstallPrompt = useCallback(() => {
    setCanInstall(false)
    setShowInstallPrompt(false)
    sessionStorage.setItem('pwa-install-dismissed', 'true')
  }, [])

  return {
    isInstalled,
    canInstall,
    showOfflineNotice,
    isOnline,
    showInstallPrompt,
    installPrompt,
    installApp,
    handleInstall,
    dismissInstallPrompt,
  }
}
