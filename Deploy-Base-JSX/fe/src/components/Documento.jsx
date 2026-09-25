/** Impaginazione delle pagine di testo (Privacy, Cookie): colonna leggibile, titoli e tabelle. */
export default function Documento({ sopratitolo, titolo, aggiornato, children }) {
  return (
    <article className="mx-auto flex w-full max-w-3xl flex-col gap-space-lg px-4 py-space-lg sm:px-margin">
      <header className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
        <span className="text-label-sm font-bold uppercase tracking-wider text-secondary">{sopratitolo}</span>
        <h1 className="mt-1 font-display text-[26px] leading-[34px] font-bold tracking-tight text-on-surface md:text-headline-lg">
          {titolo}
        </h1>
        <p className="mt-1 text-body-sm text-outline">Ultimo aggiornamento: {aggiornato}</p>
      </header>
      <div className="documento flex flex-col gap-space-md rounded-xl bg-surface-container-lowest p-space-lg text-body-lg text-on-surface-variant shadow-sm sm:p-space-xl">
        {children}
      </div>
    </article>
  )
}

export function Sezione({ titolo, children }) {
  return (
    <section className="flex flex-col gap-space-sm">
      <h2 className="font-display text-headline-sm text-on-surface">{titolo}</h2>
      {children}
    </section>
  )
}

export function Tabella({ intestazioni, righe }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-outline-variant">
      <table className="w-full text-left text-body-sm">
        <thead className="bg-surface-container-low text-on-surface">
          <tr>
            {intestazioni.map((t) => (
              <th key={t} scope="col" className="px-3 py-2 font-semibold">
                {t}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant">
          {righe.map((r) => (
            <tr key={r[0]}>
              {r.map((c, i) => (
                <td key={i} className={`px-3 py-2 align-top ${i === 0 ? 'font-medium text-on-surface' : ''}`}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
