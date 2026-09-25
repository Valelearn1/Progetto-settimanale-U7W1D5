import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '@/lib/api'
import { Messaggio, Pulsante, SchedaCentrata } from '@/components/Form'

/**
 * Pagina del link nella mail. Serve un clic di conferma (POST): i client di
 * posta che aprono i link in anteprima non disattivano niente da soli.
 */
export default function DisattivaAvviso() {
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''
  const [esito, setEsito] = useState(null) // null | 'fatto' | 'non-valido'
  const [errore, setErrore] = useState(null)
  const [invio, setInvio] = useState(false)

  async function disattiva() {
    setInvio(true)
    setErrore(null)
    try {
      await api.disattivaAvviso(token)
      setEsito('fatto')
    } catch (err) {
      if (err.stato === 404 || err.stato === 400) setEsito('non-valido')
      else setErrore(err.message)
    } finally {
      setInvio(false)
    }
  }

  return (
    <SchedaCentrata icona="notifications_off" titolo="Disattiva avviso di prezzo">
      {!token || esito === 'non-valido' ? (
        <Messaggio>Il link non è valido o è già stato usato.</Messaggio>
      ) : esito === 'fatto' ? (
        <div className="flex flex-col gap-space-md">
          <Messaggio tipo="successo">Avviso disattivato: non riceverai altre mail per questa auto.</Messaggio>
          <Link to="/avvisi" className="text-center text-label-md font-semibold text-secondary hover:underline">
            Gestisci i tuoi avvisi
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-space-md">
          <p className="text-center text-body-md text-on-surface-variant">
            Confermi di voler smettere di ricevere mail per questo avviso? Potrai riattivarlo in qualsiasi momento.
          </p>
          <Messaggio>{errore}</Messaggio>
          <Pulsante onClick={disattiva} caricamento={invio}>
            {invio ? 'Disattivazione…' : 'Sì, disattiva'}
          </Pulsante>
          <Link to="/" className="text-center text-label-md text-outline hover:underline">
            Annulla
          </Link>
        </div>
      )}
    </SchedaCentrata>
  )
}
