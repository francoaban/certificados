import { useEffect, useState } from 'react'

// Captura el aviso de instalación del navegador para ofrecer un botón propio
export default function useInstallPrompt() {
  const [promptEvent, setPromptEvent] = useState(null)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    const onPrompt = (e) => {
      e.preventDefault()
      setPromptEvent(e)
    }
    const onInstalled = () => {
      setInstalled(true)
      setPromptEvent(null)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const install = async () => {
    if (!promptEvent) return
    await promptEvent.prompt()
    const choice = await promptEvent.userChoice
    if (choice.outcome === 'accepted') setInstalled(true)
    setPromptEvent(null)
  }

  return { canInstall: !!promptEvent && !installed, install }
}