import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { usePreferitiAvvisi } from '@/hooks/usePreferitiAvvisi'
import AutoCard from '@/components/AutoCard'
import ModaleAvviso from '@/components/ModaleAvviso'
import IntestazionePagina from '@/components/IntestazionePagina'
import { Messaggio } from '@/components/Form'

export default function Preferiti() {
  const { preferiti, avvisi, pronto, rimuoviPreferito, salvaAvviso } = usePreferitiAvvisi()
  const [autoAvviso, setAutoAvviso] = useState(null)
  const [errore, setErrore] = useState(null)
  const chiudi = useCallback(() => setAutoAvviso(null), [])
  const elenco = [...preferiti.values()]

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-space-lg px-4 py-space-lg sm:px-margin">
      <IntestazionePagina
        sopratitolo="La tua selezione"
        titolo="I miei Preferiti"
        descrizione="Le auto che segui. Imposta una soglia per ricevere una mail quando il prezzo scende."
        azioni={
          <span className="rounded-full bg-surface-container px-3 py-1 text-label-md font-semibold text-secondary">
            {elenco.length} auto
          </span>
        }
      />
      <Messaggio>{errore}</Messaggio>

      {!pronto ? (
        <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="h-96 animate-pulse rounded-xl bg-surface-container-lowest shadow-sm" />
          ))}
        </div>
      ) : elenco.length === 0 ? (
        <div className="flex flex-col items-center gap-space-sm rounded-xl bg-surface-container-lowest p-space-xl text-center shadow-sm">
          <span className="icona text-5xl text-outline">heart_plus</span>
          <h2 className="font-display text-title-md text-on-surface">Nessun preferito</h2>
          <p className="text-body-sm text-on-surface-variant">Tocca il cuore su un'auto del catalogo per salvarla qui.</p>
          <Link to="/" className="mt-space-sm rounded-lg bg-primary px-space-md py-2 text-label-md font-semibold text-on-primary">
            Sfoglia il catalogo
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {elenco.map(({ auto }) => (
            <AutoCard
              key={auto.id}
              auto={auto}
              immagini={auto.immagini ?? (auto.copertina ? [auto.copertina] : [])}
              preferito
              avviso={avvisi.get(auto.id)}
              onPreferito={() => rimuoviPreferito(auto.id).catch((e) => setErrore(e.message))}
              onAvviso={() => setAutoAvviso(auto)}
            />
          ))}
        </div>
      )}

      {autoAvviso && (
        <ModaleAvviso
          auto={autoAvviso}
          avviso={avvisi.get(autoAvviso.id)}
          preferito
          onChiudi={chiudi}
          onSalva={(soglia) => salvaAvviso(autoAvviso.id, soglia)}
        />
      )}
    </div>
  )
}
