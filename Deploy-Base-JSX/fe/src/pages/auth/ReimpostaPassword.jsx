import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '@/lib/api'
import { Campo, Messaggio, Pulsante, SchedaCentrata } from '@/components/Form'

export default function ReimpostaPassword() {
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''
  const [password, setPassword] = useState('')
  const [conferma, setConferma] = useState('')
  const [errore, setErrore] = useState(null)
  const [fatto, setFatto] = useState(false)
  const [invio, setInvio] = useState(false)

  async function invia(e) {
    e.preventDefault()
    if (password.length < 8) return setErrore('La password deve avere almeno 8 caratteri.')
    if (password !== conferma) return setErrore('Le password non coincidono.')
    setErrore(null)
    setInvio(true)
    try {
      await api.reimpostaPassword(token, password)
      setFatto(true)
    } catch (err) {
      setErrore(err.stato === 400 ? 'Il link non è valido o è scaduto. Richiedine uno nuovo.' : err.message)
    } finally {
      setInvio(false)
    }
  }

  return (
    <SchedaCentrata icona="password" titolo="Nuova password">
      {!token ? (
        <Messaggio>
          Link incompleto. <Link to="/password-dimenticata" className="underline">Richiedine uno nuovo</Link>.
        </Messaggio>
      ) : fatto ? (
        <div className="flex flex-col gap-space-md">
          <Messaggio tipo="successo">Password aggiornata. Ora puoi accedere con la nuova password.</Messaggio>
          <Link to="/login" className="rounded-lg bg-primary py-2.5 text-center text-label-md font-semibold text-on-primary">
            Vai al login
          </Link>
        </div>
      ) : (
        <form onSubmit={invia} className="flex flex-col gap-space-md">
          <Campo
            id="password"
            etichetta="Nuova password"
            icona="lock"
            type="password"
            autoComplete="new-password"
            maxLength={72}
            aiuto="Almeno 8 caratteri."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Campo
            id="conferma"
            etichetta="Conferma password"
            icona="lock"
            type="password"
            autoComplete="new-password"
            maxLength={72}
            value={conferma}
            onChange={(e) => setConferma(e.target.value)}
          />
          <Messaggio>{errore}</Messaggio>
          <Pulsante type="submit" caricamento={invio}>
            {invio ? 'Salvataggio…' : 'Salva la nuova password'}
          </Pulsante>
          {errore && (
            <Link to="/password-dimenticata" className="text-center text-label-md font-semibold text-secondary hover:underline">
              Richiedi un nuovo link
            </Link>
          )}
        </form>
      )}
    </SchedaCentrata>
  )
}
