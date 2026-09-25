/** Pezzi di form nello stile del design: campo con etichetta, messaggi, pulsante. */

export function Campo({ id, etichetta, icona, errore, aiuto, className = '', ...props }) {
  return (
    <div className={`space-y-1 ${className}`}>
      <label htmlFor={id} className="block text-label-md font-semibold text-on-surface">
        {etichetta}
      </label>
      <div className="relative">
        {icona && <span className="icona pointer-events-none absolute top-2.5 left-3 text-lg text-outline">{icona}</span>}
        <input
          id={id}
          aria-invalid={Boolean(errore)}
          aria-describedby={errore ? `${id}-errore` : aiuto ? `${id}-aiuto` : undefined}
          className={`w-full rounded-lg bg-surface-container-low py-2.5 pr-3 text-body-md text-on-surface transition-all placeholder:text-outline focus:bg-surface-container-lowest focus:ring-2 focus:ring-secondary focus:outline-none ${icona ? 'pl-10' : 'pl-3'} ${errore ? 'ring-2 ring-error' : ''}`}
          {...props}
        />
      </div>
      {errore ? (
        <p id={`${id}-errore`} className="text-body-sm text-error">
          {errore}
        </p>
      ) : (
        aiuto && (
          <p id={`${id}-aiuto`} className="text-body-sm text-outline">
            {aiuto}
          </p>
        )
      )}
    </div>
  )
}

export function Messaggio({ tipo = 'errore', children }) {
  if (!children) return null
  const stile =
    tipo === 'errore'
      ? 'bg-error-container text-on-error-container'
      : tipo === 'successo'
        ? 'bg-success-container text-on-success-container'
        : 'bg-surface-container text-on-surface'
  return (
    <div role={tipo === 'errore' ? 'alert' : 'status'} className={`rounded-lg p-space-sm text-label-md ${stile}`}>
      {children}
    </div>
  )
}

export function Pulsante({ variante = 'primario', caricamento, children, className = '', ...props }) {
  const stili = {
    primario: 'bg-primary text-on-primary hover:bg-primary-container shadow-sm',
    secondario: 'bg-secondary text-on-secondary hover:bg-secondary-container shadow-sm',
    tenue: 'bg-surface-container text-on-surface hover:bg-surface-container-high',
    pericolo: 'bg-error-container text-on-error-container hover:bg-error hover:text-on-primary',
  }
  return (
    <button
      disabled={caricamento || props.disabled}
      className={`flex items-center justify-center gap-1.5 rounded-lg px-space-md py-2.5 text-label-md font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${stili[variante]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

/** Riquadro centrato per login, registrazione e simili. */
export function SchedaCentrata({ icona, titolo, sottotitolo, children, piede }) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-space-md px-4 py-space-xl">
      <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm sm:p-space-xl">
        <div className="mb-space-lg flex flex-col items-center gap-space-sm text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary-fixed text-secondary">
            <span className="icona text-2xl">{icona}</span>
          </div>
          <h1 className="font-display text-headline-md text-on-surface">{titolo}</h1>
          {sottotitolo && <p className="text-body-md text-on-surface-variant">{sottotitolo}</p>}
        </div>
        {children}
      </div>
      {piede && <div className="text-center text-body-md text-on-surface-variant">{piede}</div>}
    </div>
  )
}

/** "nome: messaggio" dai dettagli del backend -> { nome: messaggio } */
export function erroriPerCampo(errore) {
  const mappa = {}
  for (const riga of errore?.dettagli ?? []) {
    const [campo, ...resto] = riga.split(': ')
    if (!mappa[campo]) mappa[campo] = resto.join(': ')
  }
  return mappa
}
