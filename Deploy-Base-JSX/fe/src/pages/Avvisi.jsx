import { useState } from 'react'
import { Link } from 'react-router-dom'
import { usePreferitiAvvisi } from '@/hooks/usePreferitiAvvisi'
import { euro } from '@/lib/formato'
import IntestazionePagina from '@/components/IntestazionePagina'
import { Messaggio } from '@/components/Form'

function RigaAvviso({ avviso, onSalva, onElimina }) {
  const [modifica, setModifica] = useState(false)
  const [soglia, setSoglia] = useState(String(Number(avviso.soglia)))
  const [errore, setErrore] = useState(null)
  const prezzo = Number(avviso.prezzoAttuale)
  const valoreSoglia = Number(avviso.soglia)
  // Quanto deve ancora scendere il prezzo perche' l'avviso scatti.
  const mancano = Math.max(0, prezzo - valoreSoglia)
  const percentuale = prezzo > 0 ? Math.round((mancano / prezzo) * 100) : 0

  async function salva(e) {
    e.preventDefault()
    const valore = Number(soglia)
    if (!Number.isFinite(valore) || valore <= 0) return setErrore('Importo non valido.')
    if (valore >= prezzo) return setErrore('La soglia deve essere inferiore al prezzo attuale.')
    try {
      await onSalva(valore)
      setErrore(null)
      setModifica(false)
    } catch (err) {
      setErrore(err.message)
    }
  }

  return (
    <li className="flex flex-col gap-space-md rounded-xl bg-surface-container-lowest p-space-md shadow-sm sm:p-space-lg md:flex-row md:items-center md:justify-between">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Link to={`/auto/${avviso.autoId}`} className="font-display text-title-md text-on-surface hover:text-secondary">
            {avviso.titoloAuto}
          </Link>
          <span
            className={`rounded-full px-2 py-0.5 text-label-sm font-bold uppercase ${avviso.attivo ? 'bg-secondary/15 text-secondary' : 'bg-surface-container text-outline'}`}
          >
            {avviso.attivo ? 'Attivo' : 'Disattivato'}
          </span>
        </div>
        <div className="mt-space-sm grid grid-cols-3 gap-space-sm text-center sm:max-w-md">
          <div className="rounded-lg bg-surface-container-low p-2">
            <span className="block text-label-sm text-outline">Prezzo attuale</span>
            <span className="font-semibold text-on-surface">{euro(prezzo)}</span>
          </div>
          <div className="rounded-lg bg-surface-container-low p-2">
            <span className="block text-label-sm text-outline">Soglia</span>
            <span className="font-semibold text-secondary">{euro(valoreSoglia)}</span>
          </div>
          <div className="rounded-lg bg-surface-container-low p-2">
            <span className="block text-label-sm text-outline">Mancano</span>
            <span className="font-semibold text-on-surface">-{percentuale}%</span>
          </div>
        </div>
        {!avviso.attivo && (
          <p className="mt-space-sm text-body-sm text-on-surface-variant">
            Disattivato dal link nella mail. Salva una nuova soglia per riattivarlo.
          </p>
        )}
      </div>

      {modifica ? (
        <form onSubmit={salva} className="flex flex-col gap-space-xs md:w-64">
          <label htmlFor={`soglia-${avviso.id}`} className="text-label-md font-semibold text-on-surface">
            Nuova soglia (€)
          </label>
          <div className="flex gap-2">
            <input
              id={`soglia-${avviso.id}`}
              type="number"
              min="1"
              value={soglia}
              onChange={(e) => setSoglia(e.target.value)}
              className="w-full rounded-lg bg-surface-container-low px-3 py-2 text-body-md focus:ring-2 focus:ring-secondary focus:outline-none"
            />
            <button type="submit" className="rounded-lg bg-primary px-3 text-label-md font-semibold text-on-primary">
              Salva
            </button>
          </div>
          <button type="button" onClick={() => setModifica(false)} className="text-left text-label-sm text-outline hover:underline">
            Annulla
          </button>
          <Messaggio>{errore}</Messaggio>
        </form>
      ) : (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setModifica(true)}
            className="flex items-center gap-1 rounded-lg bg-surface-container px-3 py-2 text-label-md font-semibold text-secondary hover:bg-surface-container-high"
          >
            <span className="icona text-base">edit</span> {avviso.attivo ? 'Modifica' : 'Riattiva'}
          </button>
          <button
            type="button"
            onClick={() => onElimina().catch((e) => setErrore(e.message))}
            className="flex items-center gap-1 rounded-lg bg-error-container px-3 py-2 text-label-md font-semibold text-on-error-container hover:bg-error hover:text-on-primary"
          >
            <span className="icona text-base">delete</span> Elimina
          </button>
        </div>
      )}
    </li>
  )
}

export default function Avvisi() {
  const { avvisi, pronto, salvaAvviso, eliminaAvviso } = usePreferitiAvvisi()
  const elenco = [...avvisi.values()]

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-space-lg px-4 py-space-lg sm:px-margin">
      <IntestazionePagina
        sopratitolo="Notifiche via email"
        titolo="Avvisi Prezzo"
        descrizione="Ti scriviamo quando il prezzo di un'auto scende sotto la soglia che hai scelto. Una mail per ogni ribasso."
      />
      {!pronto ? (
        <div className="h-40 animate-pulse rounded-xl bg-surface-container-lowest shadow-sm" />
      ) : elenco.length === 0 ? (
        <div className="flex flex-col items-center gap-space-sm rounded-xl bg-surface-container-lowest p-space-xl text-center shadow-sm">
          <span className="icona text-5xl text-outline">notifications_off</span>
          <h2 className="font-display text-title-md text-on-surface">Nessun avviso impostato</h2>
          <p className="text-body-sm text-on-surface-variant">Apri un'auto e scegli "Avvisami se il prezzo scende".</p>
          <Link to="/catalogo" className="mt-space-sm rounded-lg bg-primary px-space-md py-2 text-label-md font-semibold text-on-primary">
            Sfoglia il catalogo
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-space-md">
          {elenco.map((a) => (
            <RigaAvviso
              key={a.id}
              avviso={a}
              onSalva={(soglia) => salvaAvviso(a.autoId, soglia)}
              onElimina={() => eliminaAvviso(a.autoId)}
            />
          ))}
        </ul>
      )}
    </div>
  )
}
