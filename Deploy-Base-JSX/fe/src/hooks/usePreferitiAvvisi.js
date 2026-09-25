import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/auth/AuthContext'
import { api } from '@/lib/api'

/**
 * Preferiti e avvisi dell'utente collegato, indicizzati per id dell'auto.
 * Si caricano una volta per pagina (due chiamate) e poi si aggiornano in
 * memoria dopo ogni azione, senza ricaricare tutto.
 */
export function usePreferitiAvvisi() {
  const { collegato } = useAuth()
  const [preferiti, setPreferiti] = useState(new Map()) // autoId -> preferito
  const [avvisi, setAvvisi] = useState(new Map()) // autoId -> avviso
  const [pronto, setPronto] = useState(false)

  useEffect(() => {
    if (!collegato) {
      setPreferiti(new Map())
      setAvvisi(new Map())
      setPronto(true)
      return
    }
    let attivo = true
    setPronto(false)
    Promise.all([api.preferiti(), api.avvisi()])
      .then(([p, a]) => {
        if (!attivo) return
        setPreferiti(new Map(p.map((x) => [x.auto.id, x])))
        setAvvisi(new Map(a.map((x) => [x.autoId, x])))
      })
      .catch(() => {})
      .finally(() => attivo && setPronto(true))
    return () => {
      attivo = false
    }
  }, [collegato])

  const senza = (mappa, chiave) => {
    const nuova = new Map(mappa)
    nuova.delete(chiave)
    return nuova
  }

  const aggiungiPreferito = useCallback(async (autoId) => {
    const nuovo = await api.aggiungiPreferito(autoId)
    setPreferiti((m) => new Map(m).set(autoId, nuovo))
    return nuovo
  }, [])

  const rimuoviPreferito = useCallback(
    async (autoId) => {
      const esistente = preferiti.get(autoId)
      if (!esistente) return
      await api.rimuoviPreferito(esistente.id)
      setPreferiti((m) => senza(m, autoId))
      // Il backend cancella anche l'avviso collegato.
      setAvvisi((m) => senza(m, autoId))
    },
    [preferiti],
  )

  /** Crea o aggiorna l'avviso; se l'auto non e' tra i preferiti la aggiunge prima. */
  const salvaAvviso = useCallback(
    async (autoId, soglia) => {
      if (!preferiti.has(autoId)) await aggiungiPreferito(autoId)
      const esistente = avvisi.get(autoId)
      const salvato = esistente ? await api.aggiornaAvviso(esistente.id, soglia) : await api.creaAvviso(autoId, soglia)
      setAvvisi((m) => new Map(m).set(autoId, salvato))
      return salvato
    },
    [preferiti, avvisi, aggiungiPreferito],
  )

  const eliminaAvviso = useCallback(
    async (autoId) => {
      const esistente = avvisi.get(autoId)
      if (!esistente) return
      await api.eliminaAvviso(esistente.id)
      setAvvisi((m) => senza(m, autoId))
    },
    [avvisi],
  )

  return { preferiti, avvisi, pronto, aggiungiPreferito, rimuoviPreferito, salvaAvviso, eliminaAvviso }
}
