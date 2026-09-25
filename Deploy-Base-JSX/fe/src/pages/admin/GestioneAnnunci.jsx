import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '@/lib/api'
import { CARBURANTI, CONDIZIONI, ORDINAMENTI, euro, km } from '@/lib/formato'
import Paginazione from '@/components/Paginazione'
import PannelloAnnuncio from '@/components/admin/PannelloAnnuncio'
import ModalePrezzo from '@/components/admin/ModalePrezzo'
import { Messaggio } from '@/components/Form'

const PER_PAGINA = 10
const STATI = [
  { valore: '', etichetta: 'Tutti', chiave: 'totale' },
  { valore: 'PUBBLICATO', etichetta: 'Pubblicati', chiave: 'pubblicati' },
  { valore: 'BOZZA', etichetta: 'Bozze', chiave: 'bozze' },
]
const data = new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'short', year: 'numeric' })

function leggi(params) {
  const stato = params.get('stato')
  const carburante = params.get('carburante')
  const condizione = params.get('condizione')
  const ordine = params.get('sort')
  const pagina = Number.parseInt(params.get('page') ?? '1', 10)
  return {
    stato: stato === 'PUBBLICATO' || stato === 'BOZZA' ? stato : '',
    q: params.get('q') ?? '',
    carburante: carburante in CARBURANTI ? carburante : '',
    condizione: condizione in CONDIZIONI ? condizione : '',
    ordine: ORDINAMENTI.some((o) => o.valore === ordine) ? ordine : 'recenti-desc',
    pagina: Number.isFinite(pagina) && pagina > 0 ? pagina - 1 : 0,
  }
}

function Riquadro({ etichetta, valore, icona, children }) {
  return (
    <div className="flex flex-col justify-between rounded-xl bg-surface-container-lowest p-space-md shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <span className="text-label-sm uppercase tracking-wider text-outline">{etichetta}</span>
          <div className="mt-1 font-display text-[28px] leading-9 font-bold tracking-tight text-on-surface sm:text-headline-lg">
            {valore ?? '…'}
          </div>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-container text-secondary">
          <span className="icona text-xl">{icona}</span>
        </div>
      </div>
      <div className="mt-space-md text-label-sm text-on-surface-variant">{children}</div>
    </div>
  )
}

function BadgeStato({ stato, onClick, disabilitato }) {
  const pubblicato = stato === 'PUBBLICATO'
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabilitato}
      title={pubblicato ? 'Clic per rimettere in bozza' : 'Clic per pubblicare'}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold whitespace-nowrap transition-all disabled:opacity-50 ${
        pubblicato ? 'bg-secondary/15 text-secondary hover:bg-secondary/25' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
      }`}
    >
      <span className={`h-2 w-2 rounded-full ${pubblicato ? 'bg-secondary' : 'bg-outline'}`} />
      {pubblicato ? 'PUBBLICATO' : 'BOZZA'}
    </button>
  )
}

export default function GestioneAnnunci() {
  const [params, setParams] = useSearchParams()
  const filtri = useMemo(() => leggi(params), [params])
  const [statistiche, setStatistiche] = useState(null)
  const [risultato, setRisultato] = useState(null)
  const [caricamento, setCaricamento] = useState(true)
  const [errore, setErrore] = useState(null)
  const [avviso, setAvviso] = useState(null)
  const [versione, setVersione] = useState(0) // incrementata dopo ogni modifica: ricarica lista e statistiche
  const [autoPrezzo, setAutoPrezzo] = useState(null)
  const [inCorso, setInCorso] = useState(null) // id dell'auto che sta cambiando stato
  const [testo, setTesto] = useState(filtri.q)

  const modifica = params.get('modifica')
  const pannelloAperto = params.get('nuovo') === '1' || Boolean(modifica)

  const aggiorna = useCallback(
    (modifiche, { tieniPagina = false } = {}) => {
      const nuovi = new URLSearchParams(params)
      for (const [k, v] of Object.entries(modifiche)) {
        if (v === '' || v == null) nuovi.delete(k)
        else nuovi.set(k, v)
      }
      if (!tieniPagina) nuovi.delete('page')
      setParams(nuovi)
    },
    [params, setParams],
  )

  useEffect(() => {
    api.statistiche().then(setStatistiche).catch((e) => setErrore(e.message))
  }, [versione])

  useEffect(() => {
    const controllo = new AbortController()
    const [sort, dir] = filtri.ordine.split('-')
    setCaricamento(true)
    api
      .adminAuto(
        { stato: filtri.stato, q: filtri.q, carburante: filtri.carburante, condizione: filtri.condizione, sort, dir, page: filtri.pagina, size: PER_PAGINA },
        controllo.signal,
      )
      .then((r) => {
        setRisultato(r)
        setErrore(null)
      })
      .catch((e) => e.name !== 'AbortError' && setErrore(e.message))
      .finally(() => !controllo.signal.aborted && setCaricamento(false))
    return () => controllo.abort()
  }, [filtri, versione])

  // Ricerca con 400 ms di pausa, come nel catalogo.
  useEffect(() => setTesto(filtri.q), [filtri.q])
  useEffect(() => {
    if (testo.trim() === filtri.q) return
    const t = setTimeout(() => aggiorna({ q: testo.trim() }), 400)
    return () => clearTimeout(t)
  }, [testo, filtri.q, aggiorna])

  const ricarica = () => setVersione((v) => v + 1)
  const chiudiPannello = useCallback(() => aggiorna({ nuovo: '', modifica: '' }, { tieniPagina: true }), [aggiorna])
  const chiudiPrezzo = useCallback(() => setAutoPrezzo(null), [])

  function mostraAvviso(testoAvviso) {
    setAvviso(testoAvviso)
    setTimeout(() => setAvviso(null), 3500)
  }

  async function alternaStato(auto) {
    setInCorso(auto.id)
    try {
      if (auto.stato === 'PUBBLICATO') await api.bozza(auto.id)
      else await api.pubblica(auto.id)
      mostraAvviso(auto.stato === 'PUBBLICATO' ? `"${auto.titolo}" rimessa in bozza` : `"${auto.titolo}" pubblicata`)
      ricarica()
    } catch (e) {
      setErrore(e.message)
    } finally {
      setInCorso(null)
    }
  }

  async function salvaPrezzo(prezzo) {
    await api.cambiaPrezzo(autoPrezzo.id, prezzo)
    mostraAvviso(`Prezzo di "${autoPrezzo.titolo}" aggiornato a ${euro(prezzo)}`)
    ricarica()
  }

  const selectFiltro = (id, valore, onChange, opzioni, tutti) => (
    <div className="relative">
      <select
        id={id}
        value={valore}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 cursor-pointer appearance-none rounded-lg bg-surface-container px-3 pr-8 text-body-sm text-on-surface focus:outline-none"
      >
        <option value="">{tutti}</option>
        {opzioni}
      </select>
      <span className="icona pointer-events-none absolute top-2 right-2.5 text-base text-outline">expand_more</span>
    </div>
  )

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-space-lg">
      <div className="flex flex-col justify-between gap-space-md md:flex-row md:items-end">
        <div className="space-y-space-xs">
          <div className="flex flex-wrap items-center gap-space-sm">
            <span className="rounded-full bg-secondary/10 px-space-sm py-0.5 text-label-sm tracking-wide text-secondary">INVENTARIO</span>
            <span className="flex items-center gap-1 rounded-full bg-primary-container px-space-sm py-0.5 text-label-sm text-on-secondary">
              <span className="icona text-[13px] text-secondary-fixed">verified_user</span> Pannello Amministratore (Ruolo: ADMIN)
            </span>
          </div>
          <h1 className="font-display text-[26px] leading-[34px] font-bold tracking-tight text-on-surface md:text-headline-lg">
            Gestione Parco Auto &amp; Annunci
          </h1>
          <p className="max-w-2xl text-body-md text-on-surface-variant">
            Stock dello showroom di Torino: crea e modifica gli annunci, cambia i prezzi e decidi cosa pubblicare.
          </p>
        </div>
        <button
          type="button"
          onClick={() => aggiorna({ nuovo: '1', modifica: '' }, { tieniPagina: true })}
          className="flex items-center justify-center gap-space-xs rounded-lg bg-secondary px-space-lg py-2.5 text-label-md font-semibold text-on-secondary shadow-md transition-all hover:bg-secondary-container"
        >
          <span className="icona text-[18px]">add_circle</span> Nuovo Annuncio Auto
        </button>
      </div>

      <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2 xl:grid-cols-4">
        <Riquadro etichetta="Totale Auto Showroom" valore={statistiche?.totale} icona="directions_car">
          <span className="flex flex-wrap items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-secondary" /> {statistiche?.pubblicati ?? '…'} Pubblicati
            <span className="text-outline">•</span>
            <span className="h-2 w-2 rounded-full bg-outline" /> {statistiche?.bozze ?? '…'} Bozze
          </span>
        </Riquadro>
        <Riquadro etichetta="Valore Parco Pubblicato" valore={statistiche && euro(statistiche.valorePubblicati)} icona="account_balance_wallet">
          Somma dei prezzi degli annunci online
        </Riquadro>
        <Riquadro etichetta="Avvisi Prezzo Attivi" valore={statistiche?.avvisiAttivi} icona="notifications_active">
          <span className="flex items-center gap-1.5">
            <span className="icona text-sm text-secondary">bolt</span> Mail automatica sul ribasso
          </span>
        </Riquadro>
        <Riquadro etichetta="Prezzo Medio" valore={statistiche && euro(statistiche.prezzoMedio)} icona="query_stats">
          Media degli annunci pubblicati
        </Riquadro>
      </div>

      <div className="space-y-space-md rounded-xl bg-surface-container-lowest p-space-md shadow-sm">
        <div className="flex flex-col justify-between gap-space-md lg:flex-row lg:items-center">
          <div className="relative max-w-lg flex-1">
            <label htmlFor="cerca-admin" className="sr-only">
              Cerca per titolo
            </label>
            <span className="icona pointer-events-none absolute top-3 left-3.5 text-[18px] text-outline">search</span>
            <input
              id="cerca-admin"
              type="search"
              value={testo}
              maxLength={100}
              onChange={(e) => setTesto(e.target.value)}
              placeholder="Cerca per titolo o modello..."
              className="h-11 w-full rounded-lg bg-surface-container-low pr-4 pl-10 text-body-md text-on-surface placeholder:text-outline focus:bg-surface-container focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-space-xs overflow-x-auto pb-1 lg:pb-0" role="group" aria-label="Filtra per stato">
            {STATI.map((s) => (
              <button
                key={s.chiave}
                type="button"
                onClick={() => aggiorna({ stato: s.valore })}
                aria-pressed={filtri.stato === s.valore}
                className={`rounded-full px-space-md py-1.5 text-label-md whitespace-nowrap transition-all ${
                  filtri.stato === s.valore ? 'bg-primary-container text-on-secondary' : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {s.etichetta} ({statistiche?.[s.chiave] ?? '…'})
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-space-sm">
          <span className="mr-2 text-label-sm uppercase tracking-wider text-outline">Filtri:</span>
          {selectFiltro('f-carburante', filtri.carburante, (v) => aggiorna({ carburante: v }),
            Object.entries(CARBURANTI).map(([v, e]) => <option key={v} value={v}>{e}</option>), 'Alimentazione: Tutte')}
          {selectFiltro('f-condizione', filtri.condizione, (v) => aggiorna({ condizione: v }),
            Object.entries(CONDIZIONI).map(([v, e]) => <option key={v} value={v}>{e}</option>), 'Condizione: Tutte')}
          <div className="relative">
            <select
              aria-label="Ordina per"
              value={filtri.ordine}
              onChange={(e) => aggiorna({ sort: e.target.value === 'recenti-desc' ? '' : e.target.value })}
              className="h-9 cursor-pointer appearance-none rounded-lg bg-surface-container px-3 pr-8 text-body-sm text-on-surface focus:outline-none"
            >
              {ORDINAMENTI.map((o) => (
                <option key={o.valore} value={o.valore}>
                  {o.etichetta}
                </option>
              ))}
            </select>
            <span className="icona pointer-events-none absolute top-2 right-2.5 text-base text-outline">expand_more</span>
          </div>
          {(filtri.q || filtri.carburante || filtri.condizione || filtri.stato) && (
            <button
              type="button"
              onClick={() => setParams(new URLSearchParams())}
              className="ml-auto flex items-center gap-1 text-label-sm font-semibold text-secondary hover:underline"
            >
              <span className="icona text-sm">filter_alt_off</span> Azzera filtri
            </button>
          )}
        </div>
      </div>

      <Messaggio>{errore}</Messaggio>
      {avviso && (
        <div role="status" className="fixed right-4 bottom-4 z-[70] flex items-center gap-2 rounded-lg bg-primary-container px-space-md py-3 text-label-md text-on-secondary shadow-xl">
          <span className="icona text-secondary-fixed">check_circle</span> {avviso}
        </div>
      )}

      {/* Tabella: da 1280px in su (con la sidebar serve spazio) */}
      <div className={`hidden overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm xl:block ${caricamento ? 'opacity-60' : ''}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-primary-container text-on-secondary">
                {['Anteprima & Auto', 'Condizione', 'Chilometri', 'Prezzo & Avvisi', 'Stato Portale', 'Ultima Modifica', 'Azioni'].map((t, i) => (
                  <th key={t} scope="col" className={`px-space-md py-3.5 text-label-md uppercase tracking-wider text-[#bec6e0] ${i === 6 ? 'text-right' : ''} ${i === 5 ? 'hidden 2xl:table-cell' : ''}`}>
                    {t}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {risultato?.contenuto.map((a) => (
                <tr key={a.id} className="group transition-colors hover:bg-surface-container-low">
                  <td className="px-space-md py-space-md">
                    <div className="flex items-center gap-space-md">
                      <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-surface-container shadow-sm">
                        {a.copertina && <img src={a.copertina} alt="" loading="lazy" className="h-full w-full object-cover" />}
                        <span className="absolute right-1 bottom-1 rounded bg-primary/80 px-1 text-[10px] text-on-secondary backdrop-blur-md">{a.numeroFoto} Foto</span>
                      </div>
                      <div className="min-w-0">
                        <div className="max-w-[16rem] truncate font-display text-title-md text-on-surface">{a.titolo}</div>
                        <div className="text-label-sm text-outline">ID #{a.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-space-md py-space-md whitespace-nowrap">
                    <span className="rounded bg-surface-container-high px-2.5 py-1 text-label-sm font-bold text-secondary">{CONDIZIONI[a.condizione]}</span>
                  </td>
                  <td className="px-space-md py-space-md whitespace-nowrap">
                    <div className="text-sm font-semibold text-on-surface">{km(a.km)}</div>
                    <div className="text-label-sm text-outline">{CARBURANTI[a.carburante]}</div>
                  </td>
                  <td className="px-space-md py-space-md whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-title-md text-on-surface">{euro(a.prezzo)}</span>
                      <button type="button" onClick={() => setAutoPrezzo(a)} title="Modifica rapida prezzo" aria-label={`Modifica prezzo di ${a.titolo}`} className="rounded p-1 text-secondary transition-colors hover:bg-surface-container">
                        <span className="icona text-base">edit</span>
                      </button>
                    </div>
                    {a.avvisiAttivi > 0 && (
                      <div className="mt-0.5 flex items-center gap-1 text-[11px] text-secondary">
                        <span className="icona text-[12px]">notifications</span>
                        <span>
                          <strong>{a.avvisiAttivi} {a.avvisiAttivi === 1 ? 'utente attende' : 'utenti attendono'}</strong> un ribasso
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-space-md py-space-md whitespace-nowrap">
                    <BadgeStato stato={a.stato} onClick={() => alternaStato(a)} disabilitato={inCorso === a.id} />
                  </td>
                  <td className="hidden px-space-md py-space-md whitespace-nowrap 2xl:table-cell">
                    <div className="text-body-sm text-on-surface">{data.format(new Date(a.aggiornatoIl))}</div>
                  </td>
                  <td className="px-space-md py-space-md text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button type="button" onClick={() => aggiorna({ modifica: a.id, nuovo: '' }, { tieniPagina: true })} title="Modifica completa" aria-label={`Modifica ${a.titolo}`} className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container hover:text-on-surface">
                        <span className="icona text-[18px]">edit_note</span>
                      </button>
                      {a.stato === 'PUBBLICATO' && (
                        <Link to={`/auto/${a.id}`} target="_blank" rel="noopener" title="Vedi nel catalogo" aria-label={`Vedi ${a.titolo} nel catalogo`} className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container hover:text-on-surface">
                          <span className="icona text-[18px]">open_in_new</span>
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {risultato && risultato.contenuto.length === 0 && (
          <p className="p-space-xl text-center text-body-md text-on-surface-variant">Nessun annuncio con questi filtri.</p>
        )}
      </div>

      {/* Schede: mobile e tablet */}
      <ul className={`grid grid-cols-1 gap-space-sm md:grid-cols-2 xl:hidden ${caricamento ? 'opacity-60' : ''}`}>
        {risultato?.contenuto.map((a) => (
          <li key={a.id} className="flex gap-space-sm rounded-xl bg-surface-container-lowest p-space-sm shadow-sm">
            <div className="h-20 w-24 shrink-0 overflow-hidden rounded-lg bg-surface-container">
              {a.copertina && <img src={a.copertina} alt="" loading="lazy" className="h-full w-full object-cover" />}
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="truncate font-display text-title-md text-on-surface">{a.titolo}</span>
              <span className="text-label-sm text-outline">
                {CONDIZIONI[a.condizione]} · {km(a.km)} · {CARBURANTI[a.carburante]}
              </span>
              <div className="flex items-center gap-1">
                <span className="font-semibold text-on-surface">{euro(a.prezzo)}</span>
                <button type="button" onClick={() => setAutoPrezzo(a)} aria-label={`Modifica prezzo di ${a.titolo}`} className="rounded p-1 text-secondary">
                  <span className="icona text-base">edit</span>
                </button>
                {a.avvisiAttivi > 0 && (
                  <span className="flex items-center text-[11px] text-secondary">
                    <span className="icona text-[12px]">notifications</span>
                    {a.avvisiAttivi}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <BadgeStato stato={a.stato} onClick={() => alternaStato(a)} disabilitato={inCorso === a.id} />
                <button type="button" onClick={() => aggiorna({ modifica: a.id, nuovo: '' }, { tieniPagina: true })} className="flex items-center gap-1 rounded-lg px-2 py-1 text-label-sm font-semibold text-on-surface-variant hover:bg-surface-container">
                  <span className="icona text-base">edit_note</span> Modifica
                </button>
              </div>
            </div>
          </li>
        ))}
        {risultato && risultato.contenuto.length === 0 && (
          <li className="rounded-xl bg-surface-container-lowest p-space-lg text-center text-body-md text-on-surface-variant">Nessun annuncio con questi filtri.</li>
        )}
      </ul>

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

      {pannelloAperto && (
        <PannelloAnnuncio
          key={modifica ?? 'nuovo'}
          autoId={modifica}
          onChiudi={chiudiPannello}
          onSalvato={(a) => {
            chiudiPannello()
            mostraAvviso(a.stato === 'PUBBLICATO' ? `"${a.titolo}" pubblicata` : `"${a.titolo}" salvata in bozza`)
            ricarica()
          }}
        />
      )}
      {autoPrezzo && <ModalePrezzo auto={autoPrezzo} onChiudi={chiudiPrezzo} onSalva={salvaPrezzo} />}
    </div>
  )
}
