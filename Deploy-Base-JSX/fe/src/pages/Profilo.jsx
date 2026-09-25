import { useEffect, useState } from 'react'
import { useAuth } from '@/auth/AuthContext'
import { api } from '@/lib/api'
import { Campo, Messaggio, Pulsante } from '@/components/Form'
import IntestazionePagina from '@/components/IntestazionePagina'

export default function Profilo() {
  const { utente, isAdmin, aggiornaUtente } = useAuth()
  const [nome, setNome] = useState('')
  const [cognome, setCognome] = useState('')
  const [esito, setEsito] = useState(null)
  const [errore, setErrore] = useState(null)
  const [invio, setInvio] = useState(false)

  useEffect(() => {
    if (utente) {
      setNome(utente.nome)
      setCognome(utente.cognome)
    }
  }, [utente])

  async function salva(e) {
    e.preventDefault()
    setEsito(null)
    setErrore(null)
    if (!nome.trim() || !cognome.trim()) return setErrore('Nome e cognome sono obbligatori.')
    setInvio(true)
    try {
      // Solo nome e cognome: email e ruolo non si cambiano da qui.
      aggiornaUtente(await api.aggiornaProfilo(nome.trim(), cognome.trim()))
      setEsito('Profilo aggiornato.')
    } catch (err) {
      setErrore(err.message)
    } finally {
      setInvio(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-space-lg px-4 py-space-lg sm:px-margin">
      <IntestazionePagina sopratitolo="Account" titolo="Il mio profilo" />
      <div className="grid grid-cols-1 gap-space-lg md:grid-cols-3">
        <div className="flex flex-col gap-space-sm rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
          <span className="text-label-sm uppercase text-outline">Email</span>
          <span className="break-all text-body-md font-semibold text-on-surface">{utente?.email ?? '…'}</span>
          <span className="mt-space-sm text-label-sm uppercase text-outline">Ruolo</span>
          <span className="w-fit rounded-full bg-secondary-fixed px-3 py-1 text-label-sm font-semibold text-on-secondary-fixed">
            {isAdmin ? 'Amministratore' : 'Cliente'}
          </span>
        </div>
        <form onSubmit={salva} className="flex flex-col gap-space-md rounded-xl bg-surface-container-lowest p-space-lg shadow-sm md:col-span-2">
          <h2 className="font-display text-title-md text-on-surface">Dati personali</h2>
          <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2">
            <Campo id="nome" etichetta="Nome" maxLength={60} value={nome} onChange={(e) => setNome(e.target.value)} />
            <Campo id="cognome" etichetta="Cognome" maxLength={60} value={cognome} onChange={(e) => setCognome(e.target.value)} />
          </div>
          <Messaggio>{errore}</Messaggio>
          <Messaggio tipo="successo">{esito}</Messaggio>
          <Pulsante type="submit" caricamento={invio} className="self-start">
            {invio ? 'Salvataggio…' : 'Salva modifiche'}
          </Pulsante>
        </form>
      </div>
    </div>
  )
}
