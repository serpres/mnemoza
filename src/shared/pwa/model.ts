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
  isIOS: boolean
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
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    const checkInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true)
      }
    }

    const detectIOS = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      const isIOSDevice = /iphone|ipad|ipod/.test(userAgent)
      const isSafari = /safari/.test(userAgent) && !/chrome/.test(userAgent)
      setIsIOS(isIOSDevice && isSafari)
    }

    checkInstalled()
    detectIOS()

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
      // For iOS Safari, ensure we're on the correct URL before installation
      // This fixes the issue where Safari ignores start_url and uses installation page URL
      if (isIOS) {
        // Push the correct URL to history without triggering navigation
        history.pushState({}, '', '/mnemoza/')
      }

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
  }, [installPrompt, isIOS])

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
    isIOS,
    installApp,
    handleInstall,
    dismissInstallPrompt,
  }
}
