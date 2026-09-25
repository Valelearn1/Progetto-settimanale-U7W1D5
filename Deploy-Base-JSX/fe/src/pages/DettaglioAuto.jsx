import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'
import { api } from '@/lib/api'
import { CARBURANTI, CONDIZIONI, euro, km } from '@/lib/formato'
import { usePreferitiAvvisi } from '@/hooks/usePreferitiAvvisi'
import CarouselGrande from '@/components/CarouselGrande'
import ModaleAvviso from '@/components/ModaleAvviso'
import { Messaggio } from '@/components/Form'

export default function DettaglioAuto() {
  const { id } = useParams()
  const { collegato } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [auto, setAuto] = useState(null)
  const [stato, setStato] = useState('caricamento') // caricamento | ok | assente | errore
  const [errore, setErrore] = useState(null)
  const [modale, setModale] = useState(false)
  const { preferiti, avvisi, aggiungiPreferito, rimuoviPreferito, salvaAvviso, eliminaAvviso } = usePreferitiAvvisi()
  const chiudi = useCallback(() => setModale(false), [])

  useEffect(() => {
    let attivo = true
    setStato('caricamento')
    api
      .dettaglioAuto(id)
      .then((dati) => {
        if (!attivo) return
        setAuto(dati)
        setStato('ok')
        document.title = `${dati.titolo} · Veloce Motors`
      })
      .catch((e) => attivo && setStato(e.stato === 404 || e.stato === 400 ? 'assente' : 'errore'))
    return () => {
      attivo = false
      document.title = 'Veloce Motors'
    }
  }, [id])

  const richiediLogin = () => navigate('/login', { state: { da: location.pathname } })

  if (stato === 'caricamento') {
    return (
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-space-lg px-4 py-space-lg sm:px-margin lg:grid-cols-12">
        <div className="aspect-[16/10] animate-pulse rounded-xl bg-surface-container lg:col-span-8" />
        <div className="h-72 animate-pulse rounded-xl bg-surface-container lg:col-span-4" />
      </div>
    )
  }

  if (stato !== 'ok') {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-space-md px-4 py-space-xl text-center">
        <span className="icona text-5xl text-outline">{stato === 'assente' ? 'search_off' : 'error'}</span>
        <h1 className="font-display text-headline-md text-on-surface">
          {stato === 'assente' ? 'Annuncio non disponibile' : 'Errore di caricamento'}
        </h1>
        <p className="text-body-md text-on-surface-variant">
          {stato === 'assente'
            ? "L'auto potrebbe essere stata venduta o ritirata dal catalogo."
            : 'Riprova tra qualche istante.'}
        </p>
        <Link to="/" className="rounded-lg bg-primary px-space-md py-2 text-label-md font-semibold text-on-primary">
          Torna al catalogo
        </Link>
      </div>
    )
  }

  const preferito = preferiti.get(auto.id)
  const avviso = avvisi.get(auto.id)

  async function alternaPreferito() {
    if (!collegato) return richiediLogin()
    setErrore(null)
    try {
      if (preferito) await rimuoviPreferito(auto.id)
      else await aggiungiPreferito(auto.id)
    } catch (e) {
      setErrore(e.message)
    }
  }

  const specifiche = [
    { icona: 'speed', etichetta: 'Chilometraggio', valore: km(auto.km) },
    { icona: 'local_gas_station', etichetta: 'Alimentazione', valore: CARBURANTI[auto.carburante] },
    { icona: 'verified', etichetta: 'Stato', valore: CONDIZIONI[auto.condizione] },
    { icona: 'photo_library', etichetta: 'Foto', valore: auto.immagini.length },
  ]

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-space-lg px-4 py-space-lg sm:px-margin">
      <nav aria-label="Percorso" className="flex items-center gap-space-xs text-label-md text-on-surface-variant">
        <Link to="/" className="flex items-center gap-1 hover:text-secondary">
          <span className="icona text-base">arrow_back</span> Catalogo
        </Link>
        <span className="text-outline">/</span>
        <span className="truncate font-semibold text-on-surface">{auto.titolo}</span>
      </nav>

      <div className="grid grid-cols-1 items-start gap-space-lg lg:grid-cols-12">
        <div className="flex flex-col gap-space-lg lg:col-span-8">
          <CarouselGrande immagini={auto.immagini} titolo={auto.titolo} />

          <section className="grid grid-cols-2 gap-space-sm sm:grid-cols-4">
            {specifiche.map((s) => (
              <div key={s.etichetta} className="flex flex-col items-center gap-1 rounded-xl bg-surface-container-lowest p-space-md text-center shadow-sm">
                <span className="icona text-2xl text-secondary">{s.icona}</span>
                <span className="text-label-sm uppercase text-outline">{s.etichetta}</span>
                <span className="font-display text-title-md text-on-surface">{s.valore}</span>
              </div>
            ))}
          </section>

          <section className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
            <h2 className="mb-space-sm font-display text-headline-sm text-on-surface">Descrizione</h2>
            {/* Testo semplice: eventuale HTML scritto nella descrizione resta testo. */}
            <p className="text-body-lg whitespace-pre-line text-on-surface-variant">{auto.descrizione}</p>
          </section>
        </div>

        <aside className="flex flex-col gap-space-md lg:sticky lg:top-32 lg:col-span-4">
          <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
            <span className="rounded-full bg-secondary px-2.5 py-1 text-label-sm font-bold uppercase text-on-secondary">
              {CONDIZIONI[auto.condizione]}
            </span>
            <h1 className="mt-space-sm font-display text-headline-md text-on-surface">{auto.titolo}</h1>
            <p className="text-body-sm text-outline">Showroom Torino · Veloce Certified</p>

            <div className="my-space-md border-t border-surface-container pt-space-md">
              <span className="block text-label-sm text-outline">Prezzo Chiavi in Mano</span>
              <span className="font-display text-[34px] leading-10 font-extrabold tracking-tight text-on-surface">
                {euro(auto.prezzo)}
              </span>
            </div>

            {avviso && (
              <div className="mb-space-md flex items-center justify-between gap-2 rounded-lg bg-surface-container-low p-space-sm">
                <span className="flex items-center gap-1.5 text-label-md text-on-surface">
                  <span className="icona text-lg text-secondary">notifications_active</span>
                  {avviso.attivo ? `Avviso sotto ${euro(avviso.soglia)}` : 'Avviso disattivato'}
                </span>
                <button
                  type="button"
                  onClick={() => eliminaAvviso(auto.id).catch((e) => setErrore(e.message))}
                  className="text-label-sm font-semibold text-error hover:underline"
                >
                  Rimuovi
                </button>
              </div>
            )}

            <div className="flex flex-col gap-space-sm">
              <button
                type="button"
                onClick={() => (collegato ? setModale(true) : richiediLogin())}
                className="flex items-center justify-center gap-2 rounded-lg bg-primary py-3 text-label-md font-semibold text-on-primary shadow-sm transition-colors hover:bg-primary-container"
              >
                <span className="icona text-lg">notifications_active</span>
                {avviso ? 'Modifica avviso di prezzo' : 'Avvisami se il prezzo scende'}
              </button>
              <button
                type="button"
                onClick={alternaPreferito}
                aria-pressed={Boolean(preferito)}
                className="flex items-center justify-center gap-2 rounded-lg bg-surface-container py-3 text-label-md font-semibold text-on-surface transition-colors hover:bg-surface-container-high"
              >
                <span className={`icona text-lg ${preferito ? 'icona-piena text-error' : ''}`}>favorite</span>
                {preferito ? 'Nei tuoi preferiti' : 'Aggiungi ai preferiti'}
              </button>
            </div>
            <div className="mt-space-sm">
              <Messaggio>{errore}</Messaggio>
            </div>
          </div>

          <div className="flex flex-col gap-space-sm rounded-xl bg-surface-container-low p-space-lg">
            {[
              ['verified_user', 'Garanzia Europea 24 Mesi Inclusa'],
              ['fact_check', '110 Controlli Tecnici Certificati'],
              ['history', 'Chilometraggio Contrattuale Garantito'],
            ].map(([icona, testo]) => (
              <span key={testo} className="flex items-center gap-2 text-body-sm text-on-surface">
                <span className="icona text-lg text-secondary">{icona}</span>
                {testo}
              </span>
            ))}
          </div>
        </aside>
      </div>

      {modale && (
        <ModaleAvviso
          auto={auto}
          avviso={avviso}
          preferito={preferito}
          onChiudi={chiudi}
          onSalva={(soglia) => salvaAvviso(auto.id, soglia)}
        />
      )}
    </div>
  )
}
