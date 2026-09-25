import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'
import { api } from '@/lib/api'
import { Campo, Messaggio, Pulsante, SchedaCentrata } from '@/components/Form'

/** Solo percorsi interni: "//sito.com" o "https://..." non sono accettati. */
export function destinazioneSicura(da) {
  return typeof da === 'string' && da.startsWith('/') && !da.startsWith('//') ? da : '/'
}

export default function Login() {
  const { accedi } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errore, setErrore] = useState(null)
  const [invio, setInvio] = useState(false)

  async function invia(e) {
    e.preventDefault()
    setErrore(null)
    setInvio(true)
    try {
      const { token } = await api.login(email.trim(), password)
      accedi(token)
      navigate(destinazioneSicura(location.state?.da), { replace: true })
    } catch (err) {
      setErrore(err.stato === 401 ? 'Email o password non corretti.' : err.message)
    } finally {
      setInvio(false)
    }
  }

  return (
    <SchedaCentrata
      icona="login"
      titolo="Accedi"
      sottotitolo="Salva le auto preferite e ricevi un avviso quando il prezzo scende."
      piede={
        <>
          Non hai un account?{' '}
          <Link to="/registrazione" state={location.state} className="font-semibold text-secondary hover:underline">
            Registrati
          </Link>
        </>
      }
    >
      <form onSubmit={invia} className="flex flex-col gap-space-md" noValidate>
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
        <div className="space-y-1">
          <Campo
            id="password"
            etichetta="Password"
            icona="lock"
            type="password"
            autoComplete="current-password"
            required
            maxLength={72}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="text-right">
            <Link to="/password-dimenticata" className="text-label-md font-semibold text-secondary hover:underline">
              Password dimenticata?
            </Link>
          </div>
        </div>
        <Messaggio>{errore}</Messaggio>
        <Pulsante type="submit" caricamento={invio} disabled={!email || !password}>
          {invio ? 'Accesso in corso…' : 'Accedi'}
        </Pulsante>
      </form>
    </SchedaCentrata>
  )
}
