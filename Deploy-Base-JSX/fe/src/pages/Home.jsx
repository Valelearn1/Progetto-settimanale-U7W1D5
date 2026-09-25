import { Suspense, lazy, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import { useAuth } from '@/auth/AuthContext'
import { api } from '@/lib/api'
import { CARBURANTI, CONDIZIONI, euro, km } from '@/lib/formato'
import CountingNumber from '@/components/animate-ui/CountingNumber'
import { Fade, Fades } from '@/components/animate-ui/Fade'

// Sfondo a bolle (Animate UI) caricato a parte, come nel catalogo.
const BubbleBackground = lazy(() => import('@/components/animate-ui/BubbleBackground'))

const BOLLE = {
  first: '14,111,122',
  second: '32,140,152',
  third: '19,128,140',
  fourth: '6,54,60',
  fifth: '45,160,172',
  sixth: '90,190,200',
}

const PASSI = [
  { icona: 'favorite', titolo: 'Salva l’auto che ti piace', testo: 'Tocca il cuore su un annuncio: la ritrovi nei tuoi preferiti.' },
  { icona: 'tune', titolo: 'Scegli la tua soglia', testo: 'Indica il prezzo che sei disposto a pagare, per esempio il 5% in meno.' },
  { icona: 'mark_email_unread', titolo: 'Ti scriviamo noi', testo: 'Se il prezzo scende sotto la soglia ricevi una mail, una sola volta. La disattivi con un clic.' },
]

const GARANZIE = [
  { icona: 'verified_user', titolo: 'Garanzia 24 mesi', testo: 'Inclusa su ogni vettura, valida in tutta Europa.' },
  { icona: 'fact_check', titolo: '110 controlli', testo: 'Ogni auto passa una perizia completa prima di entrare in salone.' },
  { icona: 'speed', titolo: 'Km certificati', testo: 'Chilometraggio contrattuale e storico tagliandi trasparente.' },
  { icona: 'replay', titolo: 'Soddisfatti o rimborsati', testo: 'Hai 14 giorni per ripensarci dopo la consegna.' },
]

const HERO = 'relative flex min-h-[calc(100svh-7.25rem)] flex-col overflow-hidden bg-gradient-to-br from-[#0b2a30] via-[#0f3d44] to-[#0b2a30]'

function SfondoHero({ children }) {
  return (
    <Suspense fallback={<div className={HERO}>{children}</div>}>
      <BubbleBackground interactive colors={BOLLE} className={HERO}>
        <div className="pointer-events-none absolute inset-0 bg-[#0b2a30]/40" aria-hidden="true" />
        {children}
      </BubbleBackground>
    </Suspense>
  )
}

function Sezione({ id, sopratitolo, titolo, descrizione, children, className = '' }) {
  return (
    <section id={id} className={`scroll-mt-32 px-4 py-space-xl sm:px-margin md:py-24 ${className}`}>
      <div className="mx-auto flex max-w-7xl flex-col gap-space-lg">
        <Fade inView inViewMargin="-80px" className="max-w-2xl">
          <span className="text-label-sm font-bold uppercase tracking-wider text-secondary">{sopratitolo}</span>
          <h2 className="mt-1 font-display text-[28px] leading-9 font-bold tracking-tight text-on-surface md:text-headline-lg">{titolo}</h2>
          {descrizione && <p className="mt-2 text-body-lg text-on-surface-variant">{descrizione}</p>}
        </Fade>
        {children}
      </div>
    </section>
  )
}

export default function Home() {
  const { collegato } = useAuth()
  const fermo = useReducedMotion()
  const [dati, setDati] = useState(null)

  // Una sola chiamata: le 3 auto piu' recenti e, nella stessa risposta, il totale.
  useEffect(() => {
    api.cercaAuto({ sort: 'recenti', dir: 'desc', page: 0, size: 3 }).then(setDati).catch(() => setDati(null))
  }, [])

  const totale = dati?.totaleElementi ?? 0

  return (
    <div className="flex flex-col">
      {/* ---------- apertura ---------- */}
      <SfondoHero>
        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center gap-space-lg px-4 py-space-xl sm:px-margin">
          <Fade className="flex flex-col gap-space-md">
            <span className="text-label-md font-bold uppercase tracking-[0.2em] text-[#9ae3eb]">Showroom Torino · Corso Giulio Cesare 250</span>
            <h1 className="max-w-4xl font-display text-[40px] leading-[46px] font-extrabold tracking-tight text-white sm:text-[56px] sm:leading-[62px] lg:text-[72px] lg:leading-[76px]">
              L’auto giusta,
              <br />
              <span className="text-[#6fd3de]">al prezzo giusto.</span>
            </h1>
            <p className="max-w-2xl text-body-lg text-white/85 sm:text-[18px] sm:leading-8">
              Nuove, km 0 e usato garantito da Mole Motors. Salva le auto che ti piacciono: quando il prezzo scende sotto
              la tua soglia, ti scriviamo noi.
            </p>
          </Fade>

          <Fade delay={150} className="flex flex-wrap gap-space-sm">
            <Link
              to="/catalogo"
              className="flex items-center gap-2 rounded-lg bg-white px-space-lg py-3 text-label-md font-semibold text-[#0f2e33] shadow-lg transition-transform hover:-translate-y-0.5"
            >
              Esplora il catalogo <span className="icona text-lg">arrow_forward</span>
            </Link>
            <a
              href="#come-funziona"
              className="flex items-center gap-2 rounded-lg bg-white/10 px-space-lg py-3 text-label-md font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/20"
            >
              <span className="icona text-lg">notifications_active</span> Come funzionano gli avvisi
            </a>
          </Fade>

          <Fade delay={300} className="mt-space-md grid max-w-2xl grid-cols-3 gap-space-md border-t border-white/15 pt-space-lg">
            {[
              { valore: totale, etichetta: 'auto disponibili' },
              { valore: 110, etichetta: 'controlli per auto' },
              { valore: 24, etichetta: 'mesi di garanzia' },
            ].map((n) => (
              <div key={n.etichetta}>
                <div className="font-display text-[32px] leading-10 font-extrabold text-white sm:text-[40px] sm:leading-[48px]">
                  <CountingNumber number={n.valore} />
                </div>
                <div className="text-label-md text-white/70">{n.etichetta}</div>
              </div>
            ))}
          </Fade>
        </div>

        <a
          href="#ultimi-arrivi"
          aria-label="Scorri alle ultime auto arrivate"
          className="relative z-10 mx-auto mb-space-lg flex flex-col items-center gap-1 text-label-sm text-white/70 hover:text-white"
        >
          Scorri
          <motion.span
            className="icona text-2xl"
            animate={fermo ? undefined : { y: [0, 6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          >
            keyboard_arrow_down
          </motion.span>
        </a>
      </SfondoHero>

      {/* ---------- ultimi arrivi ---------- */}
      <Sezione
        id="ultimi-arrivi"
        sopratitolo="Appena arrivate"
        titolo="Gli ultimi arrivi in salone"
        descrizione="Le vetture entrate più di recente. Ogni scheda ha le foto, i dettagli e il prezzo chiavi in mano."
      >
        <div className="grid grid-cols-1 gap-space-md md:grid-cols-3">
          {dati ? (
            <Fades inView inViewMargin="-80px" holdDelay={120} className="h-full">
              {dati.contenuto.map((a) => (
                <Link
                  key={a.id}
                  to={`/auto/${a.id}`}
                  className="group flex h-full flex-col overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm transition-shadow hover:shadow-xl"
                >
                  <div className="aspect-[16/10] overflow-hidden bg-surface-container">
                    {a.copertina && (
                      <img src={a.copertina} alt={a.titolo} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-1 p-space-md">
                    <span className="text-label-sm font-semibold text-secondary">{CONDIZIONI[a.condizione]} · {CARBURANTI[a.carburante]}</span>
                    <span className="font-display text-title-md text-on-surface group-hover:text-secondary">{a.titolo}</span>
                    <span className="text-body-sm text-outline">{km(a.km)}</span>
                    <span className="mt-auto pt-space-sm font-display text-numeric text-on-surface">{euro(a.prezzo)}</span>
                  </div>
                </Link>
              ))}
            </Fades>
          ) : (
            Array.from({ length: 3 }, (_, i) => <div key={i} className="h-80 animate-pulse rounded-xl bg-surface-container-lowest shadow-sm" />)
          )}
        </div>
        <Fade inView className="flex justify-center">
          <Link
            to="/catalogo"
            className="flex items-center gap-2 rounded-lg bg-primary px-space-lg py-3 text-label-md font-semibold text-on-primary shadow-sm transition-colors hover:bg-primary-container"
          >
            Vedi tutte le {totale || ''} auto <span className="icona text-lg">arrow_forward</span>
          </Link>
        </Fade>
      </Sezione>

      {/* ---------- come funziona ---------- */}
      <Sezione
        id="come-funziona"
        sopratitolo="Avvisi di prezzo"
        titolo="Il prezzo scende? Te lo diciamo noi."
        descrizione="Non devi controllare ogni giorno: bastano tre passi e un account gratuito."
        className="bg-surface-container-low"
      >
        <ol className="grid grid-cols-1 gap-space-md md:grid-cols-3">
          <Fades inView inViewMargin="-80px" holdDelay={120} className="h-full">
            {PASSI.map((p, i) => (
              <li key={p.titolo} className="flex h-full flex-col gap-space-sm rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
                <div className="flex items-center gap-space-sm">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary-fixed text-secondary">
                    <span className="icona">{p.icona}</span>
                  </span>
                  <span className="text-label-sm font-bold uppercase tracking-wider text-outline">Passo {i + 1}</span>
                </div>
                <h3 className="font-display text-headline-sm text-on-surface">{p.titolo}</h3>
                <p className="text-body-md text-on-surface-variant">{p.testo}</p>
              </li>
            ))}
          </Fades>
        </ol>
      </Sezione>

      {/* ---------- garanzie ---------- */}
      <Sezione sopratitolo="Perché Mole Motors" titolo="Ogni auto, controllata e garantita">
        <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2 lg:grid-cols-4">
          <Fades inView inViewMargin="-80px" holdDelay={90} className="h-full">
            {GARANZIE.map((g) => (
              <div key={g.titolo} className="flex h-full flex-col gap-space-sm rounded-xl border border-outline-variant p-space-lg">
                <span className="icona text-3xl text-secondary">{g.icona}</span>
                <h3 className="font-display text-title-md text-on-surface">{g.titolo}</h3>
                <p className="text-body-sm text-on-surface-variant">{g.testo}</p>
              </div>
            ))}
          </Fades>
        </div>
      </Sezione>

      {/* ---------- invito finale ---------- */}
      <section className="px-4 pb-space-xl sm:px-margin md:pb-24">
        <Fade inView className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-space-lg rounded-2xl bg-gradient-to-br from-[#0b2a30] via-[#0f3d44] to-[#13808c] p-space-lg text-white shadow-lg sm:p-space-xl md:flex-row md:items-center">
          <div>
            <h2 className="font-display text-[28px] leading-9 font-bold tracking-tight md:text-headline-lg">Trova la tua prossima auto</h2>
            <p className="mt-1 text-body-lg text-white/80">{totale ? `${totale} vetture` : 'Tutte le vetture'} ti aspettano nel catalogo, con filtri per prezzo, chilometri e alimentazione.</p>
          </div>
          <div className="flex flex-wrap gap-space-sm">
            <Link to="/catalogo" className="flex items-center gap-2 rounded-lg bg-white px-space-lg py-3 text-label-md font-semibold text-[#0f2e33] shadow-sm">
              Vai al catalogo <span className="icona text-lg">arrow_forward</span>
            </Link>
            {!collegato && (
              <Link to="/registrazione" className="rounded-lg bg-white/10 px-space-lg py-3 text-label-md font-semibold text-white backdrop-blur-md hover:bg-white/20">
                Crea un account
              </Link>
            )}
          </div>
        </Fade>
      </section>
    </div>
  )
}
