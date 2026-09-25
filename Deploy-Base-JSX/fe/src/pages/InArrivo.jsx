import { Link } from 'react-router-dom'

/** Segnaposto per le pagine non ancora costruite. */
export default function InArrivo({ titolo }) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-space-md px-4 py-space-xl text-center">
      <span className="icona text-5xl text-secondary">construction</span>
      <h1 className="font-display text-headline-md text-on-surface">{titolo}</h1>
      <p className="text-body-md text-on-surface-variant">Questa pagina arriva nei prossimi passi.</p>
      <Link to="/" className="rounded-lg bg-primary px-space-md py-2 text-label-md font-semibold text-on-primary">
        Torna al catalogo
      </Link>
    </div>
  )
}
