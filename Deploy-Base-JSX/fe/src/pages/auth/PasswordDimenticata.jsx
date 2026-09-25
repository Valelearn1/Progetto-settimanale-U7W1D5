import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '@/lib/api'
import { Campo, Messaggio, Pulsante, SchedaCentrata } from '@/components/Form'

export default function PasswordDimenticata() {
  const [email, setEmail] = useState('')
  const [inviata, setInviata] = useState(false)
  const [errore, setErrore] = useState(null)
  const [invio, setInvio] = useState(false)

  async function invia(e) {
    e.preventDefault()
    setErrore(null)
    setInvio(true)
    try {
      await api.passwordDimenticata(email.trim())
      setInviata(true)
    } catch (err) {
      setErrore(err.message)
    } finally {
      setInvio(false)
    }
  }

  return (
    <SchedaCentrata
      icona="lock_reset"
      titolo="Password dimenticata"
      sottotitolo="Inserisci l'email del tuo account: ti mandiamo un link per sceglierne una nuova."
      piede={
        <Link to="/login" className="font-semibold text-secondary hover:underline">
          Torna al login
        </Link>
      }
    >
      {inviata ? (
        // Stesso messaggio che l'email esista o no: la pagina non rivela chi e' registrato.
        <Messaggio tipo="successo">
          Se l'indirizzo è registrato, riceverai a breve una mail con il link. Il link vale 120 minuti e si può usare
          una volta sola.
        </Messaggio>
      ) : (
        <form onSubmit={invia} className="flex flex-col gap-space-md">
          <Campo
            id="email"
            etichetta="Email"
            icona="alternate_email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Messaggio>{errore}</Messaggio>
          <Pulsante type="submit" caricamento={invio} disabled={!email}>
            {invio ? 'Invio…' : 'Invia il link'}
          </Pulsante>
        </form>
      )}
    </SchedaCentrata>
  )
}
