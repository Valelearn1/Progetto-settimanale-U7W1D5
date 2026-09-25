/**
 * Numeri di pagina da mostrare: prima, ultima e le vicine a quella corrente,
 * con "…" nei salti. Le pagine sono 0-based come nel backend.
 */
function numeri(pagina, totale) {
  const scelti = new Set([0, totale - 1, pagina - 1, pagina, pagina + 1])
  const ordinati = [...scelti].filter((n) => n >= 0 && n < totale).sort((a, b) => a - b)
  const risultato = []
  ordinati.forEach((n, i) => {
    if (i > 0 && n - ordinati[i - 1] > 1) risultato.push(`salto-${n}`)
    risultato.push(n)
  })
  return risultato
}

export default function Paginazione({ pagina, totalePagine, totaleElementi, onCambia }) {
  if (totalePagine <= 1) return null
  const base = 'flex h-9 w-9 items-center justify-center rounded-lg text-label-md font-semibold transition-colors'

  return (
    <nav
      aria-label="Paginazione catalogo"
      className="flex w-full flex-col items-center justify-between gap-space-md rounded-xl bg-surface-container-lowest p-space-md shadow-sm sm:flex-row"
    >
      <span className="text-body-sm text-on-surface-variant">
        Pagina <strong className="text-on-surface">{pagina + 1}</strong> di {totalePagine} (Totale{' '}
        <strong className="text-on-surface">{totaleElementi} veicoli</strong>)
      </span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onCambia(pagina - 1)}
          disabled={pagina === 0}
          aria-label="Pagina precedente"
          className={`${base} bg-surface-container-low text-on-surface hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-50`}
        >
          <span className="icona text-base">chevron_left</span>
        </button>
        {numeri(pagina, totalePagine).map((n) =>
          typeof n === 'string' ? (
            <span key={n} className="px-2 text-outline">
              …
            </span>
          ) : (
            <button
              key={n}
              type="button"
              onClick={() => onCambia(n)}
              aria-current={n === pagina ? 'page' : undefined}
              className={
                n === pagina
                  ? `${base} bg-primary font-bold text-on-primary shadow-sm`
                  : `${base} bg-surface-container-low text-on-surface hover:bg-surface-container`
              }
            >
              {n + 1}
            </button>
          ),
        )}
        <button
          type="button"
          onClick={() => onCambia(pagina + 1)}
          disabled={pagina >= totalePagine - 1}
          aria-label="Pagina successiva"
          className={`${base} bg-surface-container-low text-on-surface hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-50`}
        >
          <span className="icona text-base">chevron_right</span>
        </button>
      </div>
      <span className="hidden text-label-sm text-on-surface-variant md:inline">10 veicoli per pagina</span>
    </nav>
  )
}
