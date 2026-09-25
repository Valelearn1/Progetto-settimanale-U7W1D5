import { Suspense, lazy, useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'
import { api } from '@/lib/api'
import { CARBURANTI, CONDIZIONI, ORDINAMENTI, euro, km } from '@/lib/formato'
import AutoCard from '@/components/AutoCard'
import Paginazione from '@/components/Paginazione'
import ModaleAvviso from '@/components/ModaleAvviso'
// Sfondo animato caricato a parte: motion pesa ~180 KB e non deve rallentare il catalogo.
const BubbleBackground = lazy(() => import('@/components/animate-ui/BubbleBackground'))
import { usePreferitiAvvisi } from '@/hooks/usePreferitiAvvisi'

const PER_PAGINA = 10
const KM_MAX_SLIDER = 150000
const ORDINE_DEFAULT = 'recenti-desc'
// Bolle dello sfondo animato (Animate UI) nei toni della palette Petrolio, in "r,g,b".
// Toni profondi: le bolle chiare passerebbero sotto il testo bianco e lo renderebbero illeggibile.
const BOLLE_PETROLIO = {
  first: '14,111,122',
  second: '32,140,152',
  third: '19,128,140',
  fourth: '6,54,60',
  fifth: '45,160,172',
  sixth: '90,190,200',
}

/** Legge dall'URL solo i valori ammessi: il resto viene ignorato. */
function leggiFiltri(params) {
  const condizione = params.get('condizione')
  const carburante = params.get('carburante')
  const ordine = params.get('sort')
  const pagina = Number.parseInt(params.get('page') ?? '1', 10)
  return {
    q: params.get('q') ?? '',
    condizione: condizione in CONDIZIONI ? condizione : '',
    carburante: carburante in CARBURANTI ? carburante : '',
    prezzoMin: params.get('prezzoMin') ?? '',
    prezzoMax: params.get('prezzoMax') ?? '',
    kmMax: params.get('kmMax') ?? '',
    ordine: ORDINAMENTI.some((o) => o.valore === ordine) ? ordine : ORDINE_DEFAULT,
    // Nell'URL le pagine partono da 1, nel backend da 0.
    pagina: Number.isFinite(pagina) && pagina > 0 ? pagina - 1 : 0,
  }
}

export default function Catalogo() {
  const [params, setParams] = useSearchParams()
  const filtri = useMemo(() => leggiFiltri(params), [params])
  const { collegato } = useAuth()
  const navigate = useNavigate()

  const [risultato, setRisultato] = useState(null)
  const [caricamento, setCaricamento] = useState(true)
  const [errore, setErrore] = useState(null)

  // ---------- chiamata al catalogo: una per ogni combinazione di filtri ----------
  useEffect(() => {
    const controllo = new AbortController()
    const [sort, dir] = filtri.ordine.split('-')
    setCaricamento(true)
    setErrore(null)
    api
      .cercaAuto(
        {
          q: filtri.q,
          condizione: filtri.condizione,
          carburante: filtri.carburante,
          prezzoMin: filtri.prezzoMin,
          prezzoMax: filtri.prezzoMax,
          kmMax: filtri.kmMax,
          sort,
          dir,
          page: filtri.pagina,
          size: PER_PAGINA,
        },
        controllo.signal,
      )
      .then(setRisultato)
      .catch((e) => e.name !== 'AbortError' && setErrore(e.message))
      .finally(() => !controllo.signal.aborted && setCaricamento(false))
    return () => controllo.abort()
  }, [filtri])

  /** Aggiorna l'URL; ogni cambio di filtro riporta alla prima pagina. */
  const aggiorna = useCallback(
    (modifiche, { tieniPagina = false } = {}) => {
      const nuovi = new URLSearchParams(params)
      for (const [chiave, valore] of Object.entries(modifiche)) {
        if (valore === '' || valore === null || valore === undefined) nuovi.delete(chiave)
        else nuovi.set(chiave, valore)
      }
      if (!tieniPagina) nuovi.delete('page')
      setParams(nuovi)
    },
    [params, setParams],
  )

  // ---------- preferiti e avvisi dell'utente ----------
  const { preferiti, avvisi, aggiungiPreferito, rimuoviPreferito, salvaAvviso } = usePreferitiAvvisi()
  const [autoAvviso, setAutoAvviso] = useState(null)
  const chiudiAvviso = useCallback(() => setAutoAvviso(null), [])

  const richiediLogin = () => navigate('/login', { state: { da: `/?${params.toString()}` } })

  async function alternaPreferito(auto) {
    if (!collegato) return richiediLogin()
    try {
      if (preferiti.has(auto.id)) await rimuoviPreferito(auto.id)
      else await aggiungiPreferito(auto.id)
    } catch (e) {
      setErrore(e.message)
    }
  }

  function apriAvviso(auto) {
    if (!collegato) return richiediLogin()
    setAutoAvviso(auto)
  }

  // ---------- rendering ----------
  const totale = risultato?.totaleElementi ?? 0
  const primo = totale === 0 ? 0 : filtri.pagina * PER_PAGINA + 1
  const ultimo = Math.min((filtri.pagina + 1) * PER_PAGINA, totale)

  return (
    <>
      <section className="w-full bg-surface-container-low px-4 py-space-sm sm:px-margin">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-space-sm text-body-sm text-on-surface-variant">
          <div className="flex flex-wrap items-center gap-space-md">
            <span className="flex items-center gap-1 text-label-md text-on-surface">
              <span className="icona text-base text-secondary">verified</span> 110 Controlli Certificati
            </span>
            <span className="text-outline-variant">|</span>
            <span className="flex items-center gap-1">
              <span className="icona text-base text-secondary">history</span> Cronologia Tagliandi Trasparente
            </span>
            <span className="hidden text-outline-variant sm:inline">|</span>
            <span className="hidden items-center gap-1 sm:flex">
              <span className="icona text-base text-secondary">security</span> Garanzia Europea 24 Mesi Inclusa
            </span>
          </div>
          <div className="flex items-center gap-space-xs text-label-sm font-semibold uppercase text-secondary">
            <span className="h-2 w-2 animate-pulse rounded-full bg-secondary" />
            Showroom Aperto: Consulenti Online
          </div>
        </div>
      </section>

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-space-lg px-4 py-space-lg sm:px-margin">
        <Intestazione filtri={filtri} totale={totale} aggiorna={aggiorna} />

        <div className="grid grid-cols-1 items-start gap-space-lg lg:grid-cols-12">
          <PannelloFiltri filtri={filtri} aggiorna={aggiorna} />

          <section className="flex flex-col gap-space-lg lg:col-span-9">
            <div className="flex flex-wrap items-center justify-between gap-space-sm rounded-xl bg-surface-container-lowest p-space-md shadow-sm">
              <div className="flex items-center gap-2">
                <span className="icona text-lg text-secondary">check_circle</span>
                <span className="text-body-sm font-semibold text-on-surface">
                  Tutti i veicoli includono: check-up meccanico completo, pulizia antibatterica e cronologia
                  trasparente.
                </span>
              </div>
              <div className="text-label-sm text-outline">
                Mostrando{' '}
                <span className="font-bold text-on-surface">
                  {primo}-{ultimo}
                </span>{' '}
                di {totale} risultati
              </div>
            </div>

            {errore && (
              <p role="alert" className="rounded-xl bg-error-container p-space-md text-body-md text-on-error-container">
                {errore}
              </p>
            )}

            {caricamento && !risultato ? (
              <div className="grid grid-cols-1 gap-space-md md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }, (_, i) => (
                  <div key={i} className="h-[26rem] animate-pulse rounded-xl bg-surface-container-lowest shadow-sm" />
                ))}
              </div>
            ) : risultato && risultato.contenuto.length === 0 ? (
              <NessunRisultato onAzzera={() => setParams(new URLSearchParams())} />
            ) : (
              risultato && (
                <div
                  className={`grid grid-cols-1 gap-space-md transition-opacity md:grid-cols-2 xl:grid-cols-3 ${caricamento ? 'opacity-60' : ''}`}
                >
                  {risultato.contenuto.map((auto) => (
                    <AutoCard
                      key={auto.id}
                      auto={auto}
                      immagini={auto.immagini}
                      preferito={preferiti.get(auto.id)}
                      avviso={avvisi.get(auto.id)}
                      onPreferito={() => alternaPreferito(auto)}
                      onAvviso={() => apriAvviso(auto)}
                    />
                  ))}
                </div>
              )
            )}

            {risultato && (
              <Paginazione
                pagina={risultato.pagina}
                totalePagine={risultato.totalePagine}
                totaleElementi={risultato.totaleElementi}
                onCambia={(p) => {
                  aggiorna({ page: p + 1 }, { tieniPagina: true })
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
              />
            )}

            <section className="flex w-full flex-col items-center justify-between gap-space-lg rounded-xl bg-surface-container-low p-space-lg md:flex-row">
              <div className="flex items-center gap-space-md">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-secondary-fixed text-secondary">
                  <span className="icona text-3xl">verified_user</span>
                </div>
                <div>
                  <h4 className="font-display text-title-md text-on-surface">Standard di Qualità 'Veloce Certified'</h4>
                  <p className="max-w-xl text-body-sm text-on-surface-variant">
                    Ogni veicolo viene consegnato con perizia, storico completo dei chilometri, assenza di danni
                    strutturali e sanificazione completa dell'abitacolo.
                  </p>
                </div>
              </div>
            </section>
          </section>
        </div>
      </div>

      {autoAvviso && (
        <ModaleAvviso
          auto={autoAvviso}
          avviso={avvisi.get(autoAvviso.id)}
          preferito={preferiti.get(autoAvviso.id)}
          onChiudi={chiudiAvviso}
          onSalva={(soglia) => salvaAvviso(autoAvviso.id, soglia)}
        />
      )}
    </>
  )
}

// ---------- sfondo dell'intestazione: statico subito, bolle animate appena caricate ----------

const CLASSI_HERO = 'relative overflow-hidden rounded-xl bg-gradient-to-br from-[#0b2a30] via-[#0f3d44] to-[#0b2a30] shadow-lg'

function SfondoHero({ children }) {
  return (
    <Suspense fallback={<div className={CLASSI_HERO}>{children}</div>}>
      <BubbleBackground interactive colors={BOLLE_PETROLIO} className={CLASSI_HERO}>
        {/* Velo scuro tra bolle e testo: il contrasto resta buono ovunque passi la luce. */}
        <div className="pointer-events-none absolute inset-0 bg-[#0b2a30]/35" aria-hidden="true" />
        {children}
      </BubbleBackground>
    </Suspense>
  )
}

// ---------- intestazione: titolo, ricerca, filtri rapidi, ordinamento ----------

function Intestazione({ filtri, totale, aggiorna }) {
  const [testo, setTesto] = useState(filtri.q)

  // Se la ricerca cambia da fuori (es. dalla barra nell'header) si riallinea il campo.
  useEffect(() => setTesto(filtri.q), [filtri.q])

  // La ricerca parte 400 ms dopo l'ultima lettera: niente chiamata a ogni tasto.
  useEffect(() => {
    if (testo.trim() === filtri.q) return
    const t = setTimeout(() => aggiorna({ q: testo.trim() }), 400)
    return () => clearTimeout(t)
  }, [testo, filtri.q, aggiorna])

  const pillole = [{ valore: '', etichetta: 'Tutti' }, ...Object.entries(CONDIZIONI).map(([valore, etichetta]) => ({ valore, etichetta }))]

  return (
    <SfondoHero>
    <header className="relative z-10 flex w-full flex-col gap-space-md p-space-lg">
      <div className="flex flex-col justify-between gap-space-md md:flex-row md:items-end">
        <div>
          <span className="text-label-sm font-bold uppercase tracking-wider text-[#9ae3eb]">
            Inventario Certificato Torino
          </span>
          <h1 className="mt-1 font-display text-[26px] leading-[34px] font-bold tracking-tight text-white md:text-headline-lg">
            Parco Auto Disponibile
          </h1>
          <p className="mt-0.5 flex flex-wrap items-center gap-2 text-body-md text-white/80">
            <span className="inline-flex items-center justify-center rounded-full bg-white/15 px-2 py-0.5 text-label-sm font-semibold text-white backdrop-blur-sm">
              {totale} veicoli
            </span>
            selezionati, periziati e pronti per il ritiro immediato.
          </p>
        </div>
        <div className="relative w-full md:w-96">
          <label htmlFor="ricerca-catalogo" className="sr-only">
            Cerca per marca o modello
          </label>
          <span className="icona pointer-events-none absolute top-2.5 left-3 text-[#5f7071]">search</span>
          <input
            id="ricerca-catalogo"
            type="search"
            value={testo}
            maxLength={100}
            onChange={(e) => setTesto(e.target.value)}
            placeholder="Cerca per marca o modello (es. Golf, Tesla)..."
            className="w-full rounded-lg bg-white/95 py-2.5 pr-10 pl-10 text-body-md text-[#10201f] shadow-sm transition-all placeholder:text-[#5f7071] focus:bg-white focus:ring-2 focus:ring-[#6fd3de] focus:outline-none"
          />
          {testo && (
            <button
              type="button"
              onClick={() => setTesto('')}
              aria-label="Azzera testo di ricerca"
              className="absolute top-2.5 right-3 text-[#5f7071] transition-colors hover:text-[#10201f]"
            >
              <span className="icona text-sm">close</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-space-md rounded-lg bg-white/10 p-space-sm backdrop-blur-md">
        <div className="flex items-center gap-space-xs overflow-x-auto py-1">
          <span className="mr-1 text-label-sm font-semibold uppercase text-white/70">Filtro rapido:</span>
          {pillole.map((p) => (
            <button
              key={p.valore || 'tutti'}
              type="button"
              onClick={() => aggiorna({ condizione: p.valore })}
              aria-pressed={filtri.condizione === p.valore}
              className={
                filtri.condizione === p.valore
                  ? 'rounded-full bg-white px-space-md py-1 text-label-sm font-semibold whitespace-nowrap text-[#0f2e33] shadow-sm'
                  : 'rounded-full bg-white/15 px-space-md py-1 text-label-sm whitespace-nowrap text-white transition-colors hover:bg-white/25'
              }
            >
              {p.etichetta}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <label htmlFor="ordinamento" className="hidden text-label-md whitespace-nowrap text-white/80 sm:inline">
            Ordina per:
          </label>
          <div className="relative">
            <select
              id="ordinamento"
              value={filtri.ordine}
              onChange={(e) => aggiorna({ sort: e.target.value === ORDINE_DEFAULT ? '' : e.target.value })}
              className="cursor-pointer appearance-none rounded-lg bg-white py-2 pr-8 pl-3 text-label-md text-[#10201f] shadow-sm focus:ring-2 focus:ring-[#6fd3de] focus:outline-none"
            >
              {ORDINAMENTI.map((o) => (
                <option key={o.valore} value={o.valore}>
                  {o.etichetta}
                </option>
              ))}
            </select>
            <span className="icona pointer-events-none absolute top-2 right-2 text-base text-[#5f7071]">expand_more</span>
          </div>
        </div>
      </div>
    </header>
    </SfondoHero>
  )
}

// ---------- barra laterale: prezzo, chilometri, alimentazione ----------

function PannelloFiltri({ filtri, aggiorna }) {
  // Bozza locale: l'URL (e quindi la chiamata) cambia solo con "Applica Filtri".
  const [bozza, setBozza] = useState(filtri)
  useEffect(() => setBozza(filtri), [filtri])
  // Sotto i 1024px il pannello e' chiuso e si apre con il pulsante "Filtri".
  const [aperto, setAperto] = useState(false)
  const attivi = [filtri.prezzoMin, filtri.prezzoMax, filtri.kmMax, filtri.carburante].filter(Boolean).length

  const kmSlider = bozza.kmMax === '' ? KM_MAX_SLIDER : Number(bozza.kmMax)

  const [erroreFiltri, setErroreFiltri] = useState(null)

  function applica(e) {
    e.preventDefault()
    if (bozza.prezzoMin !== '' && bozza.prezzoMax !== '' && Number(bozza.prezzoMin) > Number(bozza.prezzoMax)) {
      setErroreFiltri('Il prezzo minimo è più alto del massimo.')
      return
    }
    setErroreFiltri(null)
    aggiorna({
      prezzoMin: bozza.prezzoMin,
      prezzoMax: bozza.prezzoMax,
      kmMax: bozza.kmMax,
      carburante: bozza.carburante,
    })
    setAperto(false)
  }

  function reimposta() {
    setErroreFiltri(null)
    aggiorna({ prezzoMin: '', prezzoMax: '', kmMax: '', carburante: '' })
  }

  const campoNumero = (chiave, etichetta) => (
    <div className="flex-1">
      <label htmlFor={`filtro-${chiave}`} className="mb-1 block text-label-sm text-outline">
        {etichetta}
      </label>
      <div className="flex items-center rounded-lg bg-surface-container-low px-2.5 py-1.5">
        <span className="mr-1 text-xs text-outline">€</span>
        <input
          id={`filtro-${chiave}`}
          type="number"
          min="0"
          step="500"
          value={bozza[chiave]}
          onChange={(e) => setBozza((b) => ({ ...b, [chiave]: e.target.value }))}
          className="w-full bg-transparent text-label-md text-on-surface focus:outline-none"
        />
      </div>
    </div>
  )

  return (
    <aside className="flex flex-col gap-space-lg rounded-xl bg-surface-container-lowest p-space-md shadow-sm sm:p-space-lg lg:sticky lg:top-32 lg:col-span-3">
      <button
        type="button"
        onClick={() => setAperto((a) => !a)}
        aria-expanded={aperto}
        aria-controls="pannello-filtri"
        className="flex w-full items-center justify-between lg:hidden"
      >
        <span className="flex items-center gap-2">
          <span className="icona text-secondary">tune</span>
          <span className="font-display text-title-md text-on-surface">Filtri</span>
          {attivi > 0 && (
            <span className="rounded-full bg-secondary px-2 py-0.5 text-label-sm text-on-secondary">{attivi}</span>
          )}
        </span>
        <span className="icona text-outline">{aperto ? 'expand_less' : 'expand_more'}</span>
      </button>
      <form id="pannello-filtri" onSubmit={applica} className={`${aperto ? 'flex' : 'hidden'} flex-col gap-space-lg lg:flex`}>
        <div className="flex items-center justify-between">
          <div className="hidden items-center gap-2 lg:flex">
            <span className="icona text-secondary">tune</span>
            <h2 className="font-display text-title-md text-on-surface">Filtri di Ricerca</h2>
          </div>
          <button
            type="button"
            onClick={reimposta}
            className="text-label-sm font-semibold text-secondary underline transition-colors hover:text-primary"
          >
            Azzera tutto
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-label-md font-semibold text-on-surface">Budget di Spesa (€)</span>
            <span className="text-label-sm font-bold text-secondary">
              {bozza.prezzoMin ? euro(bozza.prezzoMin) : '€0'} - {bozza.prezzoMax ? euro(bozza.prezzoMax) : 'max'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {campoNumero('prezzoMin', 'Minimo')}
            <span className="mt-5 text-outline">-</span>
            {campoNumero('prezzoMax', 'Massimo')}
          </div>
          {erroreFiltri && (
            <p role="alert" className="text-body-sm text-error">
              {erroreFiltri}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="filtro-km" className="text-label-md font-semibold text-on-surface">
              Chilometri Max
            </label>
            <span className="text-label-sm font-semibold text-on-surface">
              {bozza.kmMax === '' ? 'Nessun limite' : km(kmSlider)}
            </span>
          </div>
          <input
            id="filtro-km"
            type="range"
            min="0"
            max={KM_MAX_SLIDER}
            step="5000"
            value={kmSlider}
            onChange={(e) =>
              setBozza((b) => ({ ...b, kmMax: Number(e.target.value) >= KM_MAX_SLIDER ? '' : e.target.value }))
            }
            className="w-full cursor-pointer accent-secondary"
          />
          <div className="flex justify-between text-label-sm text-outline">
            <span>0 km</span>
            <span>150.000+ km</span>
          </div>
        </div>

        <fieldset className="space-y-2">
          <legend className="mb-2 block text-label-md font-semibold text-on-surface">Alimentazione</legend>
          <div className="space-y-1.5">
            {[['', 'Tutte'], ...Object.entries(CARBURANTI)].map(([valore, etichetta]) => (
              <label
                key={valore || 'tutte'}
                className="flex cursor-pointer items-center gap-2 rounded-lg bg-surface-container-low p-2 text-body-sm text-on-surface transition-colors hover:bg-surface-container"
              >
                <input
                  type="radio"
                  name="carburante"
                  value={valore}
                  checked={bozza.carburante === valore}
                  onChange={() => setBozza((b) => ({ ...b, carburante: valore }))}
                  className="h-4 w-4 accent-secondary"
                />
                {etichetta}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="flex flex-col gap-2 pt-2">
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-label-md font-semibold text-on-primary shadow-sm transition-all hover:bg-on-primary-fixed-variant active:scale-[0.99]"
          >
            <span className="icona text-sm">filter_alt</span> Applica Filtri
          </button>
          <button
            type="button"
            onClick={reimposta}
            className="w-full rounded-lg bg-surface-container py-2 text-center text-label-sm font-medium text-on-surface transition-colors hover:bg-surface-container-high"
          >
            Reimposta Parametri
          </button>
        </div>
      </form>
    </aside>
  )
}

function NessunRisultato({ onAzzera }) {
  return (
    <div className="flex flex-col items-center gap-space-sm rounded-xl bg-surface-container-lowest p-space-xl text-center shadow-sm">
      <span className="icona text-5xl text-outline">search_off</span>
      <h3 className="font-display text-title-md text-on-surface">Nessun veicolo trovato</h3>
      <p className="text-body-sm text-on-surface-variant">Prova ad allargare i filtri o a cercare un altro modello.</p>
      <button
        type="button"
        onClick={onAzzera}
        className="mt-space-sm rounded-lg bg-primary px-space-md py-2 text-label-md font-semibold text-on-primary"
      >
        Azzera tutti i filtri
      </button>
    </div>
  )
}
