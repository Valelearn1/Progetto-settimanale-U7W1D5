import { Link } from 'react-router-dom'

/** Indirizzo inesistente. */
export default function NonTrovata() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-space-md px-4 py-space-xl text-center">
      <span className="icona text-5xl text-secondary">wrong_location</span>
      <h1 className="font-display text-headline-md text-on-surface">Pagina non trovata</h1>
      <p className="text-body-md text-on-surface-variant">L'indirizzo che hai aperto non esiste o è stato spostato.</p>
      <Link to="/" className="rounded-lg bg-primary px-space-md py-2 text-label-md font-semibold text-on-primary">
        Torna alla home
      </Link>
    </div>
  )
}
