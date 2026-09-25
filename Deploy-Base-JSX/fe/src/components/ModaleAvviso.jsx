import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@/auth/AuthContext'
import { euro } from '@/lib/formato'
import { useTrappolaFocus } from '@/hooks/useTrappolaFocus'

/**
 * Modale "Imposta Avviso Soglia Prezzo". La mail la manda il server
 * all'indirizzo dell'account: qui si mostra soltanto, non si puo' cambiare.
 */
export default function ModaleAvviso({ auto, avviso, preferito, onChiudi, onSalva }) {
  const { utente } = useAuth()
  const prezzo = Number(auto.prezzo)
  const [soglia, setSoglia] = useState(avviso ? String(Number(avviso.soglia)) : String(Math.round(prezzo * 0.95)))
  const [errore, setErrore] = useState(null)
  const [invio, setInvio] = useState(false)
  const [salvato, setSalvato] = useState(false)
  const campo = useRef(null)
  const finestra = useRef(null)

  useEffect(() => {
    campo.current?.focus()
    const esc = (e) => e.key === 'Escape' && onChiudi()
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [onChiudi])
  useTrappolaFocus(finestra)

  async function salva(e) {
    e.preventDefault()
    const valore = Number(soglia)
    if (!Number.isFinite(valore) || valore <= 0) {
      setErrore('Inserisci un importo valido.')
      return
    }
    if (valore >= prezzo) {
      setErrore('La soglia deve essere inferiore al prezzo attuale.')
      return
    }
    setErrore(null)
    setInvio(true)
    try {
      await onSalva(valore)
      setSalvato(true)
      setTimeout(onChiudi, 1200)
    } catch (err) {
      setErrore(err.message)
    } finally {
      setInvio(false)
    }
  }

  const sconto = (percentuale) => Math.round(prezzo * (1 - percentuale))

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="titolo-modale-avviso"
      className="fixed inset-0 z-50 flex items-center justify-center bg-scrim/60 p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onChiudi()}
    >
      <div ref={finestra} className="w-full max-w-lg overflow-hidden rounded-xl bg-surface-container-lowest shadow-2xl">
        <div className="flex items-center justify-between bg-surface-container p-space-lg">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary-fixed text-secondary">
              <span className="icona text-lg">notifications_active</span>
            </div>
            <div>
              <h3 id="titolo-modale-avviso" className="font-display text-title-md leading-tight text-on-surface">
                Imposta Avviso Soglia Prezzo
              </h3>
              <span className="text-label-sm text-outline">Notifica via email</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onChiudi}
            aria-label="Chiudi"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container-lowest text-outline transition-colors hover:text-on-surface"
          >
            <span className="icona text-sm">close</span>
          </button>
        </div>

        <form onSubmit={salva} className="space-y-space-md p-space-lg">
          <div className="flex items-center justify-between gap-space-md rounded-lg bg-surface-container-low p-space-md">
            <div>
              <span className="block text-label-sm text-outline">Veicolo Monitorato</span>
              <span className="block text-label-md font-bold text-on-surface">{auto.titolo}</span>
            </div>
            <div className="text-right">
              <span className="block text-label-sm text-outline">Prezzo Attuale</span>
              <span className="font-display text-title-md font-bold text-secondary">{euro(prezzo)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="soglia" className="block text-label-md font-semibold text-on-surface">
              Avvisami via email quando il prezzo scende sotto:
            </label>
            <div className="relative">
              <span className="absolute top-2.5 left-3 font-bold text-outline">€</span>
              <input
                ref={campo}
                id="soglia"
                type="number"
                min="1"
                step="1"
                required
                value={soglia}
                onChange={(e) => setSoglia(e.target.value)}
                className="w-full rounded-lg bg-surface-container-low py-2.5 pr-12 pl-8 text-headline-sm font-bold text-on-surface transition-all focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-secondary"
              />
              <span className="absolute top-3 right-3 text-label-sm text-outline">EUR</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-label-sm text-outline">Suggeriti:</span>
              {[0.05, 0.1].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setSoglia(String(sconto(p)))}
                  className="rounded-md bg-surface-container px-2.5 py-1 text-label-sm font-medium transition-colors hover:bg-surface-container-high"
                >
                  -{p * 100}% ({euro(sconto(p))})
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <span className="block text-label-md font-semibold text-on-surface">Indirizzo Email per le Notifiche</span>
            <div className="flex items-center gap-2 rounded-lg bg-surface-container-low px-3 py-2 text-body-md text-on-surface-variant">
              <span className="icona text-base text-outline">alternate_email</span>
              {utente ? utente.email : '…'}
            </div>
          </div>

          <div className="space-y-1.5 rounded-lg bg-surface-container-low p-space-sm text-outline">
            {!preferito && (
              <p className="flex items-start gap-2 text-xs leading-relaxed">
                <span className="icona mt-0.5 text-sm text-secondary">favorite</span>
                L'auto verrà aggiunta ai tuoi preferiti: gli avvisi si impostano sulle auto che segui.
              </p>
            )}
            <p className="flex items-start gap-2 text-xs leading-relaxed">
              <span className="icona mt-0.5 text-sm text-secondary">lock</span>
              Riceverai una notifica solo quando il prezzo scende sotto la soglia. Nessuna newsletter.
            </p>
            <p className="flex items-start gap-2 text-xs leading-relaxed">
              <span className="icona mt-0.5 text-sm text-secondary">unsubscribe</span>
              Disattivazione con un clic dal link monouso presente nella mail.
            </p>
          </div>

          {errore && (
            <p role="alert" className="rounded-lg bg-error-container p-space-sm text-label-md text-on-error-container">
              {errore}
            </p>
          )}
          {salvato && (
            <p role="status" className="rounded-lg bg-success-container p-space-sm text-center text-label-md font-semibold text-on-success-container">
              Avviso salvato!
            </p>
          )}

          <div className="flex justify-end gap-2 pt-space-xs">
            <button
              type="button"
              onClick={onChiudi}
              className="rounded-lg bg-surface-container px-space-md py-2 text-label-md font-semibold text-on-surface transition-colors hover:bg-surface-container-high"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={invio || salvato}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-space-md py-2 text-label-md font-semibold text-on-primary shadow-sm transition-colors hover:bg-primary-container disabled:opacity-60"
            >
              <span className="icona text-base">notifications_active</span>
              {invio ? 'Salvataggio…' : 'Attiva Avviso'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
