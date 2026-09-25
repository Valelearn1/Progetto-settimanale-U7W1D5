import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'
import { api } from '@/lib/api'
import { Campo, Messaggio, Pulsante, SchedaCentrata, erroriPerCampo } from '@/components/Form'
import { destinazioneSicura } from '@/pages/auth/Login'

const VUOTO = { nome: '', cognome: '', email: '', password: '', conferma: '' }

function valida(dati) {
  const errori = {}
  if (!dati.nome.trim()) errori.nome = 'Inserisci il nome.'
  if (!dati.cognome.trim()) errori.cognome = 'Inserisci il cognome.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dati.email.trim())) errori.email = 'Inserisci un indirizzo email valido.'
  if (dati.password.length < 8) errori.password = 'Almeno 8 caratteri.'
  if (dati.conferma !== dati.password) errori.conferma = 'Le password non coincidono.'
  return errori
}

export default function Registrazione() {
  const { accedi } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [dati, setDati] = useState(VUOTO)
  const [errori, setErrori] = useState({})
  const [errore, setErrore] = useState(null)
  const [invio, setInvio] = useState(false)

  const campo = (nome) => ({
    value: dati[nome],
    onChange: (e) => setDati((d) => ({ ...d, [nome]: e.target.value })),
    errore: errori[nome],
  })

  async function invia(e) {
    e.preventDefault()
    const nuovi = valida(dati)
    setErrori(nuovi)
    setErrore(null)
    if (Object.keys(nuovi).length) return
    setInvio(true)
    try {
      // Si mandano solo i campi del DTO: il ruolo lo decide il server.
      const { token } = await api.registrazione({
        nome: dati.nome.trim(),
        cognome: dati.cognome.trim(),
        email: dati.email.trim(),
        password: dati.password,
      })
      accedi(token)
      navigate(destinazioneSicura(location.state?.da), { replace: true })
    } catch (err) {
      setErrori(erroriPerCampo(err))
      setErrore(err.stato === 409 ? 'Esiste già un account con questa email.' : err.message)
    } finally {
      setInvio(false)
    }
  }

  return (
    <SchedaCentrata
      icona="person_add"
      titolo="Crea un account"
      sottotitolo="Registrati per salvare i preferiti e impostare gli avvisi di prezzo."
      piede={
        <>
          Hai già un account?{' '}
          <Link to="/login" state={location.state} className="font-semibold text-secondary hover:underline">
            Accedi
          </Link>
        </>
      }
    >
      <form onSubmit={invia} className="flex flex-col gap-space-md" noValidate>
        <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2">
          <Campo id="nome" etichetta="Nome" autoComplete="given-name" maxLength={60} required {...campo('nome')} />
          <Campo id="cognome" etichetta="Cognome" autoComplete="family-name" maxLength={60} required {...campo('cognome')} />
        </div>
        <Campo
          id="email"
          etichetta="Email"
          icona="alternate_email"
          type="email"
          autoComplete="email"
          maxLength={254}
          required
          {...campo('email')}
        />
        <Campo
          id="password"
          etichetta="Password"
          icona="lock"
          type="password"
          autoComplete="new-password"
          maxLength={72}
          aiuto="Almeno 8 caratteri."
          required
          {...campo('password')}
        />
        <Campo
          id="conferma"
          etichetta="Conferma password"
          icona="lock"
          type="password"
          autoComplete="new-password"
          maxLength={72}
          required
          {...campo('conferma')}
        />
        <Messaggio>{errore}</Messaggio>
        <Pulsante type="submit" caricamento={invio}>
          {invio ? 'Registrazione…' : 'Registrati'}
        </Pulsante>
      </form>
    </SchedaCentrata>
  )
}
