import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api, impostaToken, suNonAutenticato } from '@/lib/api'

const CHIAVE = 'salone.token'
const AuthContext = createContext(null)

/** Istante di scadenza del JWT (ms) letto dal payload, o null se illeggibile. */
function scadenza(token) {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const exp = JSON.parse(atob(payload)).exp
    return typeof exp === 'number' ? exp * 1000 : null
  } catch {
    return null
  }
}

/** Token salvato, solo se non ancora scaduto: uno scaduto non si usa nemmeno. */
function leggiToken() {
  try {
    const salvato = localStorage.getItem(CHIAVE)
    if (!salvato) return null
    const fine = scadenza(salvato)
    if (fine !== null && fine <= Date.now()) {
      localStorage.removeItem(CHIAVE)
      return null
    }
    return salvato
  } catch {
    return null
  }
}

/**
 * Legge il ruolo dal JWT solo per decidere cosa mostrare (es. il link Area
 * Admin). Non e' una protezione: chi decide davvero e' il server.
 */
function ruoloDalToken(token) {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(payload)).ruolo ?? null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(leggiToken)
  const [utente, setUtente] = useState(null)

  // Il modulo api deve conoscere il token prima delle chiamate dei figli.
  impostaToken(token)

  const esci = useCallback(() => {
    try {
      localStorage.removeItem(CHIAVE)
    } catch {
      // storage non disponibile: basta lo stato in memoria
    }
    setToken(null)
    setUtente(null)
  }, [])

  const accedi = useCallback((nuovoToken) => {
    try {
      localStorage.setItem(CHIAVE, nuovoToken)
    } catch {
      // storage non disponibile: la sessione dura finche' la pagina e' aperta
    }
    setToken(nuovoToken)
  }, [])

  useEffect(() => {
    suNonAutenticato(esci)
  }, [esci])

  // Uscita automatica allo scadere del token (2 ore dal login).
  useEffect(() => {
    if (!token) return
    const fine = scadenza(token)
    if (fine === null) return
    const t = setTimeout(esci, Math.max(0, fine - Date.now()))
    return () => clearTimeout(t)
  }, [token, esci])

  // Nome ed email arrivano da /api/me: nel token non ci sono.
  useEffect(() => {
    if (!token) return
    let attivo = true
    api
      .profilo()
      .then((profilo) => attivo && setUtente(profilo))
      .catch(() => {})
    return () => {
      attivo = false
    }
  }, [token])

  const valore = useMemo(() => {
    const ruolo = token ? ruoloDalToken(token) : null
    return {
      token,
      utente,
      collegato: Boolean(token),
      isAdmin: ruolo === 'ADMIN',
      accedi,
      esci,
      aggiornaUtente: setUtente,
    }
  }, [token, utente, accedi, esci])

  return <AuthContext.Provider value={valore}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth va usato dentro AuthProvider')
  return ctx
}
