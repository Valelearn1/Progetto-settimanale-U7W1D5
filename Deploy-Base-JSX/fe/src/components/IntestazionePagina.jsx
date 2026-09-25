/** Titolo delle pagine interne, nello stile dell'intestazione del catalogo. */
export default function IntestazionePagina({ sopratitolo, titolo, descrizione, azioni }) {
  return (
    <header className="flex flex-col justify-between gap-space-md rounded-xl bg-surface-container-lowest p-space-lg shadow-sm md:flex-row md:items-end">
      <div>
        {sopratitolo && (
          <span className="text-label-sm font-bold uppercase tracking-wider text-secondary">{sopratitolo}</span>
        )}
        <h1 className="mt-1 font-display text-[26px] leading-[34px] font-bold tracking-tight text-on-surface md:text-headline-lg">
          {titolo}
        </h1>
        {descrizione && <p className="mt-0.5 text-body-md text-on-surface-variant">{descrizione}</p>}
      </div>
      {azioni && <div className="flex flex-wrap items-center gap-space-sm">{azioni}</div>}
    </header>
  )
}
