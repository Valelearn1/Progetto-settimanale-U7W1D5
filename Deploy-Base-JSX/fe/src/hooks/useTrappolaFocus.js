import { useEffect } from 'react'

const FOCALIZZABILI =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Tiene il focus da tastiera dentro una finestra modale: Tab e Maiusc+Tab
 * girano tra i suoi elementi. Alla chiusura il focus torna dove era prima
 * (di solito il pulsante che ha aperto la finestra).
 */
export function useTrappolaFocus(ref, attiva = true) {
  useEffect(() => {
    if (!attiva || !ref.current) return
    const contenitore = ref.current
    const precedente = document.activeElement

    // Se nessun elemento interno ha gia' il focus (es. un campo con autofocus), va al primo.
    if (!contenitore.contains(document.activeElement)) {
      contenitore.querySelector(FOCALIZZABILI)?.focus()
    }

    function gestisci(e) {
      if (e.key !== 'Tab') return
      const elementi = [...contenitore.querySelectorAll(FOCALIZZABILI)].filter((el) => el.offsetParent !== null)
      if (elementi.length === 0) return
      const primo = elementi[0]
      const ultimo = elementi[elementi.length - 1]
      if (e.shiftKey && document.activeElement === primo) {
        e.preventDefault()
        ultimo.focus()
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault()
        primo.focus()
      }
    }

    contenitore.addEventListener('keydown', gestisci)
    return () => {
      contenitore.removeEventListener('keydown', gestisci)
      if (precedente instanceof HTMLElement) precedente.focus()
    }
  }, [ref, attiva])
}
