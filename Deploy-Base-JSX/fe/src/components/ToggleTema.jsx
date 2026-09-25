import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'

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
 *
 * Il cambio usa la View Transitions API come il Theme Toggler di Animate UI
 * (primitives/effects/theme-toggler, (c) 2025 Elliot Sutton, MIT + Commons
 * Clause): qui il nuovo tema si allarga a cerchio partendo dal pulsante.
 * Senza supporto del browser o con prefers-reduced-motion il cambio e' istantaneo.
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

  function alterna(e) {
    const nuovo = tema === 'dark' ? 'light' : 'dark'
    try {
      localStorage.setItem(CHIAVE, nuovo)
    } catch {
      // storage non disponibile: vale solo per questa pagina
    }
    const applica = () => {
      flushSync(() => setTema(nuovo))
      document.documentElement.dataset.theme = nuovo
    }
    const ridotto = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!document.startViewTransition || ridotto) {
      applica()
      return
    }
    // Centro del pulsante e raggio fino all'angolo piu' lontano dello schermo.
    const r = e.currentTarget.getBoundingClientRect()
    const x = r.left + r.width / 2
    const y = r.top + r.height / 2
    const raggio = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))
    document.startViewTransition(applica).ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${raggio}px at ${x}px ${y}px)`] },
        { duration: 650, easing: 'ease-in-out', pseudoElement: '::view-transition-new(root)' },
      )
    })
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
