import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CARBURANTI, CONDIZIONI, euro, km } from '@/lib/formato'

const COLORE_BADGE = {
  NUOVO: 'bg-secondary text-on-secondary',
  KM_0: 'bg-primary-container text-on-secondary',
  USATO: 'bg-surface-container-lowest/90 text-on-surface',
}

/**
 * Card del catalogo. `immagini` e' la lista del carousel: si scorre con le
 * frecce o i pallini senza aprire la scheda.
 */
export default function AutoCard({ auto, immagini, preferito, avviso, onPreferito, onAvviso }) {
  const [indice, setIndice] = useState(0)
  const foto = immagini.length ? immagini : [null]
  const vai = (delta) => setIndice((i) => (i + delta + foto.length) % foto.length)

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm transition-all duration-300 hover:shadow-xl">
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface-container">
        {foto[indice] ? (
          <img
            src={foto[indice]}
            alt={`${auto.titolo} – foto ${indice + 1} di ${foto.length}`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-outline">
            <span className="icona text-5xl">directions_car</span>
          </div>
        )}

        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span
            className={`rounded-full px-2.5 py-1 text-label-sm font-bold uppercase tracking-wider shadow-sm backdrop-blur-sm ${COLORE_BADGE[auto.condizione]}`}
          >
            {CONDIZIONI[auto.condizione]}
          </span>
          {avviso?.attivo && (
            <span
              title={`Avviso attivo sotto ${euro(avviso.soglia)}`}
              className="flex items-center gap-1 rounded-full bg-surface-container-lowest/90 px-2 py-0.5 text-label-sm font-semibold text-secondary backdrop-blur-sm"
            >
              <span className="icona text-sm">notifications_active</span>
              {euro(avviso.soglia)}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onPreferito}
          aria-label={preferito ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'}
          aria-pressed={Boolean(preferito)}
          className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-surface-container-lowest/90 shadow-sm backdrop-blur-md transition-all hover:scale-110"
        >
          <span className={`icona text-xl ${preferito ? 'icona-piena text-error' : 'text-on-surface-variant'}`}>
            favorite
          </span>
        </button>

        {foto.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => vai(-1)}
              aria-label="Foto precedente"
              className="absolute top-1/2 left-2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-surface-container-lowest/80 text-on-surface opacity-0 shadow-sm transition-opacity group-hover:opacity-100 focus:opacity-100"
            >
              <span className="icona text-lg">chevron_left</span>
            </button>
            <button
              type="button"
              onClick={() => vai(1)}
              aria-label="Foto successiva"
              className="absolute top-1/2 right-2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-surface-container-lowest/80 text-on-surface opacity-0 shadow-sm transition-opacity group-hover:opacity-100 focus:opacity-100"
            >
              <span className="icona text-lg">chevron_right</span>
            </button>
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-primary-container/70 px-2.5 py-1 backdrop-blur-sm">
              {foto.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIndice(i)}
                  aria-label={`Mostra foto ${i + 1}`}
                  className={`rounded-full transition-all ${i === indice ? 'h-2 w-2 bg-on-secondary' : 'h-1.5 w-1.5 bg-on-secondary/40 hover:bg-on-secondary'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between gap-space-sm p-space-md">
        <div>
          <div className="mb-1 flex items-center justify-between text-label-sm text-outline">
            <span>Showroom Torino</span>
            <span className="font-semibold text-secondary">Veloce Certified</span>
          </div>
          <h3 className="font-display text-title-md text-on-surface transition-colors group-hover:text-secondary">
            {auto.titolo}
          </h3>
        </div>

        <div className="grid grid-cols-3 gap-1 rounded-lg bg-surface-container-low py-2 text-center text-label-sm">
          <div className="flex flex-col items-center">
            <span className="icona text-base text-outline">speed</span>
            <span className="mt-0.5 font-semibold text-on-surface">{km(auto.km)}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="icona text-base text-outline">local_gas_station</span>
            <span className="mt-0.5 font-semibold text-on-surface">{CARBURANTI[auto.carburante]}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="icona text-base text-outline">verified</span>
            <span className="mt-0.5 font-semibold text-on-surface">{CONDIZIONI[auto.condizione]}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-space-xs">
          <div>
            <span className="block text-label-sm text-outline">Prezzo Chiavi in Mano</span>
            <span className="text-numeric text-on-surface">{euro(auto.prezzo)}</span>
          </div>
          <div className="mt-1 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onAvviso}
              className="flex items-center justify-center gap-1 rounded-lg bg-surface-container px-2 py-2 text-label-sm font-semibold whitespace-nowrap text-secondary transition-colors hover:bg-surface-container-high"
            >
              <span className="icona hidden text-base 2xl:inline-block">notifications_active</span>
              {avviso ? 'Modifica Avviso' : 'Avviso Prezzo'}
            </button>
            <Link
              to={`/auto/${auto.id}`}
              className="flex items-center justify-center gap-1 rounded-lg bg-primary px-2 py-2 text-label-sm font-semibold whitespace-nowrap text-on-primary shadow-sm transition-all hover:bg-primary-container"
            >
              Scheda Auto <span className="icona text-sm">arrow_forward</span>
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}
