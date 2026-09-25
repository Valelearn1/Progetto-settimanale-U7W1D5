import { useEffect, useState } from 'react'

const CHIAVE = 'salone.tema'

function temaIniziale() {
  const attuale = document.documentElement.dataset.theme
  return attuale === 'dark' ? 'dark' : 'light'
}

function salvato() {
  try {
    const t = localStorage.getItem(CHIAVE)
    return t === 'dark' || t === 'light' ? t : null
  } catch {
    return null
  }
}

/**
 * Pulsante chiaro/scuro. La scelta resta salvata nel browser; finche' non si
 * sceglie, il sito segue l'impostazione del sistema operativo.
 */
export default function ToggleTema({ className = '' }) {
  const [tema, setTema] = useState(temaIniziale)

  useEffect(() => {
    document.documentElement.dataset.theme = tema
  }, [tema])

  // Senza una scelta salvata, si segue il sistema anche se cambia a pagina aperta.
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const segui = (e) => !salvato() && setTema(e.matches ? 'dark' : 'light')
    media.addEventListener('change', segui)
    return () => media.removeEventListener('change', segui)
  }, [])

  function alterna() {
    const nuovo = tema === 'dark' ? 'light' : 'dark'
    try {
      localStorage.setItem(CHIAVE, nuovo)
    } catch {
      // storage non disponibile: vale solo per questa pagina
    }
    setTema(nuovo)
  }

  const scuro = tema === 'dark'
  return (
    <button
      type="button"
      onClick={alterna}
      aria-label={scuro ? 'Passa al tema chiaro' : 'Passa al tema scuro'}
      title={scuro ? 'Tema chiaro' : 'Tema scuro'}
      className={`rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface ${className}`}
    >
      <span className="icona text-xl">{scuro ? 'light_mode' : 'dark_mode'}</span>
    </button>
  )
}
