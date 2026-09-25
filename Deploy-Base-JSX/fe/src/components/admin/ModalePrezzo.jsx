import { useEffect, useRef, useState } from 'react'
import { euro } from '@/lib/formato'
import { Messaggio, Pulsante } from '@/components/Form'

/** Modifica rapida del prezzo dalla tabella (PATCH, solo admin). */
export default function ModalePrezzo({ auto, onChiudi, onSalva }) {
  const [prezzo, setPrezzo] = useState(String(Number(auto.prezzo)))
  const [errore, setErrore] = useState(null)
  const [invio, setInvio] = useState(false)
  const campo = useRef(null)

  useEffect(() => {
    campo.current?.select()
    const esc = (e) => e.key === 'Escape' && onChiudi()
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [onChiudi])

  async function salva(e) {
    e.preventDefault()
    const valore = Number(prezzo)
    if (!Number.isFinite(valore) || valore <= 0) return setErrore('Inserisci un prezzo valido.')
    setInvio(true)
    try {
      await onSalva(Math.round(valore * 100) / 100)
      onChiudi()
    } catch (err) {
      setErrore(err.message)
      setInvio(false)
    }
  }

  const ribasso = Number(prezzo) < Number(auto.prezzo)

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="titolo-prezzo"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-on-surface/60 p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onChiudi()}
    >
      <form onSubmit={salva} className="w-full max-w-sm space-y-space-md rounded-xl bg-surface-container-lowest p-space-lg shadow-2xl">
        <div>
          <h3 id="titolo-prezzo" className="font-display text-title-md text-on-surface">
            Modifica prezzo
          </h3>
          <p className="text-body-sm text-on-surface-variant">{auto.titolo}</p>
        </div>
        <div className="space-y-1">
          <label htmlFor="nuovo-prezzo" className="text-label-md font-semibold text-on-surface">
            Nuovo prezzo (attuale {euro(auto.prezzo)})
          </label>
          <div className="relative">
            <span className="absolute top-2.5 left-3 font-bold text-outline">€</span>
            <input
              ref={campo}
              id="nuovo-prezzo"
              type="number"
              min="1"
              step="100"
              value={prezzo}
              onChange={(e) => setPrezzo(e.target.value)}
              className="w-full rounded-lg bg-surface-container-low py-2.5 pr-3 pl-8 text-headline-sm font-bold focus:ring-2 focus:ring-secondary focus:outline-none"
            />
          </div>
        </div>
        {ribasso && auto.avvisiAttivi > 0 && (
          <p className="flex items-start gap-2 rounded-lg bg-secondary-fixed p-space-sm text-body-sm text-on-secondary-fixed">
            <span className="icona text-base">notifications_active</span>
            {auto.avvisiAttivi} {auto.avvisiAttivi === 1 ? 'utente riceverà' : 'utenti riceveranno'} una mail se il
            nuovo prezzo scende sotto la loro soglia.
          </p>
        )}
        <Messaggio>{errore}</Messaggio>
        <div className="flex justify-end gap-2">
          <Pulsante type="button" variante="tenue" onClick={onChiudi}>
            Annulla
          </Pulsante>
          <Pulsante type="submit" caricamento={invio}>
            Salva prezzo
          </Pulsante>
        </div>
      </form>
    </div>
  )
}
