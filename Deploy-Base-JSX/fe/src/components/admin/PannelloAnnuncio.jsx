import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { CARBURANTI, CONDIZIONI } from '@/lib/formato'
import { Messaggio, Pulsante, erroriPerCampo } from '@/components/Form'

const VUOTO = {
  titolo: '',
  descrizione: '',
  km: '',
  carburante: 'BENZINA',
  prezzo: '',
  condizione: 'USATO',
  immagini: [],
  stato: 'BOZZA',
}
const MAX_IMMAGINI = 10

const SCHEDE = [
  { id: 'dati', etichetta: '1. Dati Principali' },
  { id: 'prezzo', etichetta: '2. Prezzo & Stato' },
  { id: 'galleria', etichetta: '3. Galleria Immagini' },
  { id: 'descrizione', etichetta: '4. Descrizione' },
]
// In quale scheda si trova ogni campo: serve a mostrare la scheda con l'errore.
const SCHEDA_DEL_CAMPO = { titolo: 'dati', km: 'dati', carburante: 'dati', condizione: 'dati', prezzo: 'prezzo', immagini: 'galleria', descrizione: 'descrizione' }

function urlHttpsValido(testo) {
  try {
    const url = new URL(testo)
    return url.protocol === 'https:' && Boolean(url.hostname) && !url.username && testo.length <= 500
  } catch {
    return false
  }
}

function valida(d) {
  const e = {}
  if (!d.titolo.trim()) e.titolo = 'Il titolo è obbligatorio.'
  if (d.km === '' || !Number.isInteger(Number(d.km)) || Number(d.km) < 0) e.km = 'Inserisci un numero intero ≥ 0.'
  if (d.prezzo === '' || !(Number(d.prezzo) > 0)) e.prezzo = 'Inserisci un prezzo maggiore di 0.'
  if (!d.descrizione.trim()) e.descrizione = 'La descrizione è obbligatoria.'
  if (d.stato === 'PUBBLICATO' && d.immagini.length === 0) e.immagini = 'Per pubblicare serve almeno una foto.'
  return e
}

const classeCampo = (errore) =>
  `w-full rounded-lg bg-surface-container-low px-3 py-2.5 text-body-md text-on-surface focus:bg-surface-container-lowest focus:ring-2 focus:ring-secondary focus:outline-none ${errore ? 'ring-2 ring-error' : ''}`

function Etichetta({ htmlFor, children }) {
  return (
    <label htmlFor={htmlFor} className="mb-1 block text-label-md font-semibold text-on-surface">
      {children}
    </label>
  )
}

function Errore({ children }) {
  return children ? <p className="mt-1 text-body-sm text-error">{children}</p> : null
}

/**
 * Pannello laterale per creare o modificare un annuncio (autoId null = nuovo).
 * Si mandano solo i campi di AutoRequest: niente id, date o altro.
 */
export default function PannelloAnnuncio({ autoId, onChiudi, onSalvato }) {
  const nuovo = autoId == null
  const [dati, setDati] = useState(VUOTO)
  const [scheda, setScheda] = useState('dati')
  const [caricamento, setCaricamento] = useState(!nuovo)
  const [errori, setErrori] = useState({})
  const [errore, setErrore] = useState(null)
  const [invio, setInvio] = useState(null) // 'BOZZA' | 'PUBBLICATO' | null
  const [nuovaImmagine, setNuovaImmagine] = useState('')
  const [erroreImmagine, setErroreImmagine] = useState(null)

  useEffect(() => {
    if (nuovo) return
    api
      .adminDettaglio(autoId)
      .then((a) =>
        setDati({
          titolo: a.titolo,
          descrizione: a.descrizione,
          km: String(a.km),
          carburante: a.carburante,
          prezzo: String(Number(a.prezzo)),
          condizione: a.condizione,
          immagini: a.immagini,
          stato: a.stato,
        }),
      )
      .catch((e) => setErrore(e.message))
      .finally(() => setCaricamento(false))
  }, [autoId, nuovo])

  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && onChiudi()
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [onChiudi])

  const imposta = (campo) => (e) => setDati((d) => ({ ...d, [campo]: e.target.value }))

  function aggiungiImmagine() {
    const url = nuovaImmagine.trim()
    if (!urlHttpsValido(url)) return setErroreImmagine('Serve un indirizzo https:// valido.')
    if (dati.immagini.includes(url)) return setErroreImmagine('Questa immagine è già presente.')
    if (dati.immagini.length >= MAX_IMMAGINI) return setErroreImmagine(`Al massimo ${MAX_IMMAGINI} immagini.`)
    setDati((d) => ({ ...d, immagini: [...d.immagini, url] }))
    setNuovaImmagine('')
    setErroreImmagine(null)
  }

  function sposta(indice, delta) {
    setDati((d) => {
      const lista = [...d.immagini]
      const destinazione = indice + delta
      if (destinazione < 0 || destinazione >= lista.length) return d
      ;[lista[indice], lista[destinazione]] = [lista[destinazione], lista[indice]]
      return { ...d, immagini: lista }
    })
  }

  async function salva(stato) {
    const daSalvare = { ...dati, stato }
    const nuoviErrori = valida(daSalvare)
    setErrori(nuoviErrori)
    setErrore(null)
    const primo = Object.keys(nuoviErrori)[0]
    if (primo) {
      setScheda(SCHEDA_DEL_CAMPO[primo])
      return
    }
    setInvio(stato)
    const corpo = {
      titolo: daSalvare.titolo.trim(),
      descrizione: daSalvare.descrizione,
      km: Number(daSalvare.km),
      carburante: daSalvare.carburante,
      prezzo: Number(daSalvare.prezzo),
      condizione: daSalvare.condizione,
      immagini: daSalvare.immagini,
      stato,
    }
    try {
      const salvato = nuovo ? await api.creaAuto(corpo) : await api.aggiornaAuto(autoId, corpo)
      onSalvato(salvato)
    } catch (err) {
      const perCampo = erroriPerCampo(err)
      // "immagini[0]: ..." -> errore sulla galleria
      for (const chiave of Object.keys(perCampo)) {
        if (chiave.startsWith('immagini')) perCampo.immagini = perCampo[chiave]
      }
      setErrori(perCampo)
      setErrore(err.message)
      const conErrore = Object.keys(perCampo).find((c) => SCHEDA_DEL_CAMPO[c])
      if (conErrore) setScheda(SCHEDA_DEL_CAMPO[conErrore])
    } finally {
      setInvio(null)
    }
  }

  const erroriScheda = (id) => Object.keys(errori).some((c) => SCHEDA_DEL_CAMPO[c] === id)

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="titolo-pannello">
      <div className="absolute inset-0 bg-on-surface/50 backdrop-blur-sm" onClick={onChiudi} />
      <div className="absolute top-0 right-0 flex h-full w-full max-w-2xl flex-col bg-surface-container-lowest shadow-2xl">
        <div className="flex items-center justify-between bg-surface-container p-space-lg">
          <div className="flex items-center gap-space-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary-fixed text-secondary">
              <span className="icona">drive_file_rename_outline</span>
            </div>
            <div>
              <h2 id="titolo-pannello" className="font-display text-headline-sm text-on-surface">
                {nuovo ? 'Crea Nuovo Annuncio Auto' : 'Modifica Annuncio'}
              </h2>
              <span className="text-label-sm text-outline">Showroom Torino</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onChiudi}
            aria-label="Chiudi"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-container-lowest text-outline hover:text-on-surface"
          >
            <span className="icona">close</span>
          </button>
        </div>

        <div className="flex gap-1 overflow-x-auto border-b border-surface-container px-space-md pt-space-sm" role="tablist">
          {SCHEDE.map((s) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={scheda === s.id}
              onClick={() => setScheda(s.id)}
              className={`relative rounded-t-lg px-space-md py-2 text-label-md whitespace-nowrap transition-colors ${
                scheda === s.id ? 'bg-surface-container-low font-semibold text-secondary' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {s.etichetta}
              {erroriScheda(s.id) && <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-error" />}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-space-lg">
          {caricamento ? (
            <div className="h-64 animate-pulse rounded-xl bg-surface-container" />
          ) : (
            <>
              {scheda === 'dati' && (
                <div className="space-y-space-md">
                  <div>
                    <Etichetta htmlFor="a-titolo">Titolo Annuncio *</Etichetta>
                    <input id="a-titolo" maxLength={120} value={dati.titolo} onChange={imposta('titolo')} placeholder="es. Volkswagen Golf 1.5 eTSI Life" className={classeCampo(errori.titolo)} />
                    <Errore>{errori.titolo}</Errore>
                  </div>
                  <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2">
                    <div>
                      <Etichetta htmlFor="a-condizione">Stato Veicolo</Etichetta>
                      <select id="a-condizione" value={dati.condizione} onChange={imposta('condizione')} className={classeCampo()}>
                        {Object.entries(CONDIZIONI).map(([v, e]) => (
                          <option key={v} value={v}>
                            {e}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Etichetta htmlFor="a-carburante">Alimentazione</Etichetta>
                      <select id="a-carburante" value={dati.carburante} onChange={imposta('carburante')} className={classeCampo()}>
                        {Object.entries(CARBURANTI).map(([v, e]) => (
                          <option key={v} value={v}>
                            {e}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <Etichetta htmlFor="a-km">Km Percorsi *</Etichetta>
                    <input id="a-km" type="number" min="0" step="1" value={dati.km} onChange={imposta('km')} placeholder="es. 15400" className={classeCampo(errori.km)} />
                    <Errore>{errori.km}</Errore>
                  </div>
                </div>
              )}

              {scheda === 'prezzo' && (
                <div className="space-y-space-md">
                  <div className="rounded-lg bg-surface-container-low p-space-md text-body-sm text-on-surface-variant">
                    <h4 className="mb-1 font-semibold text-on-surface">Avvisi di ribasso automatici</h4>
                    Quando il prezzo di un annuncio pubblicato scende sotto la soglia scelta da un utente, il sistema
                    gli invia subito una mail (una sola volta per soglia).
                  </div>
                  <div>
                    <Etichetta htmlFor="a-prezzo">Prezzo Chiavi in Mano (€) *</Etichetta>
                    <input id="a-prezzo" type="number" min="1" step="100" value={dati.prezzo} onChange={imposta('prezzo')} className={classeCampo(errori.prezzo)} />
                    <Errore>{errori.prezzo}</Errore>
                  </div>
                  <div>
                    <span className="mb-1 block text-label-md font-semibold text-on-surface">Stato attuale</span>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                        dati.stato === 'PUBBLICATO' ? 'bg-secondary/15 text-secondary' : 'bg-surface-container text-on-surface-variant'
                      }`}
                    >
                      <span className={`h-2 w-2 rounded-full ${dati.stato === 'PUBBLICATO' ? 'bg-secondary' : 'bg-outline'}`} />
                      {dati.stato === 'PUBBLICATO' ? 'PUBBLICATO' : 'BOZZA'}
                    </span>
                    <p className="mt-1 text-body-sm text-outline">
                      Si sceglie con i pulsanti in basso: "Salva bozza" lo nasconde dal catalogo, "Pubblica" lo rende visibile.
                    </p>
                  </div>
                </div>
              )}

              {scheda === 'galleria' && (
                <div className="space-y-space-md">
                  <div>
                    <Etichetta htmlFor="a-immagine">Aggiungi immagine (URL https)</Etichetta>
                    <div className="flex gap-2">
                      <input
                        id="a-immagine"
                        type="url"
                        value={nuovaImmagine}
                        onChange={(e) => setNuovaImmagine(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            aggiungiImmagine()
                          }
                        }}
                        placeholder="https://..."
                        className={classeCampo(erroreImmagine)}
                      />
                      <Pulsante type="button" variante="secondario" onClick={aggiungiImmagine}>
                        <span className="icona text-base">add</span> Aggiungi
                      </Pulsante>
                    </div>
                    <Errore>{erroreImmagine || errori.immagini}</Errore>
                    <p className="mt-1 text-body-sm text-outline">
                      {dati.immagini.length}/{MAX_IMMAGINI} immagini. La prima è la copertina del carousel.
                    </p>
                  </div>
                  <ul className="grid grid-cols-1 gap-space-sm sm:grid-cols-2">
                    {dati.immagini.map((url, i) => (
                      <li key={url} className="overflow-hidden rounded-lg bg-surface-container-low">
                        <div className="relative aspect-[16/10] bg-surface-container">
                          <img src={url} alt={`Immagine ${i + 1}`} className="h-full w-full object-cover" />
                          {i === 0 && (
                            <span className="absolute top-2 left-2 rounded-full bg-secondary px-2 py-0.5 text-label-sm text-on-secondary">Copertina</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between p-1.5">
                          <div className="flex gap-1">
                            <button type="button" onClick={() => sposta(i, -1)} disabled={i === 0} aria-label="Sposta prima" className="rounded p-1 hover:bg-surface-container disabled:opacity-30">
                              <span className="icona text-base">arrow_back</span>
                            </button>
                            <button type="button" onClick={() => sposta(i, 1)} disabled={i === dati.immagini.length - 1} aria-label="Sposta dopo" className="rounded p-1 hover:bg-surface-container disabled:opacity-30">
                              <span className="icona text-base">arrow_forward</span>
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => setDati((d) => ({ ...d, immagini: d.immagini.filter((u) => u !== url) }))}
                            aria-label="Rimuovi immagine"
                            className="rounded p-1 text-error hover:bg-error-container"
                          >
                            <span className="icona text-base">delete</span>
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {scheda === 'descrizione' && (
                <div>
                  <Etichetta htmlFor="a-descrizione">Descrizione *</Etichetta>
                  <textarea
                    id="a-descrizione"
                    rows={12}
                    maxLength={5000}
                    value={dati.descrizione}
                    onChange={imposta('descrizione')}
                    className={`${classeCampo(errori.descrizione)} resize-y`}
                  />
                  <div className="mt-1 flex justify-between text-body-sm text-outline">
                    <span>Il testo viene mostrato così com'è: eventuale HTML non viene interpretato.</span>
                    <span>{dati.descrizione.length}/5000</span>
                  </div>
                  <Errore>{errori.descrizione}</Errore>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex flex-col gap-space-sm border-t border-surface-container p-space-md sm:flex-row sm:items-center sm:justify-between">
          <Messaggio>{errore}</Messaggio>
          <div className="ml-auto flex gap-2">
            <Pulsante type="button" variante="tenue" onClick={() => salva('BOZZA')} caricamento={invio !== null} disabled={caricamento}>
              <span className="icona text-base">draft</span> {invio === 'BOZZA' ? 'Salvataggio…' : 'Salva bozza'}
            </Pulsante>
            <Pulsante type="button" variante="secondario" onClick={() => salva('PUBBLICATO')} caricamento={invio !== null} disabled={caricamento}>
              <span className="icona text-base">publish</span> {invio === 'PUBBLICATO' ? 'Pubblicazione…' : 'Pubblica'}
            </Pulsante>
          </div>
        </div>
      </div>
    </div>
  )
}
