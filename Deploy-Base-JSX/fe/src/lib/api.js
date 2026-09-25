// In sviluppo BASE e' vuota e il proxy di Vite inoltra /api alla 8080.
// In produzione arriva da VITE_API_URL, iniettata durante la build.
const BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

// Il token lo imposta AuthContext; qui serve solo per l'header Authorization.
let token = null
let alNonAutenticato = () => {}

export function impostaToken(nuovo) {
  token = nuovo
}

export function suNonAutenticato(callback) {
  alNonAutenticato = callback
}

/** Errore HTTP con lo stato e il messaggio scritto dal backend. */
export class ErroreApi extends Error {
  constructor(stato, messaggio, dettagli = []) {
    super(messaggio)
    this.stato = stato
    this.dettagli = dettagli
  }
}

async function chiama(percorso, { metodo = 'GET', corpo, segnale, anonima = false } = {}) {
  const headers = {}
  if (corpo !== undefined) headers['Content-Type'] = 'application/json'
  const tokenInviato = anonima ? null : token
  if (tokenInviato) headers.Authorization = `Bearer ${tokenInviato}`

  const risposta = await fetch(`${BASE}${percorso}`, {
    method: metodo,
    headers,
    body: corpo === undefined ? undefined : JSON.stringify(corpo),
    signal: segnale,
  })

  if (!risposta.ok) {
    let dati = {}
    try {
      dati = await risposta.json()
    } catch {
      // corpo non JSON: resta il messaggio generico
    }
    // Token scaduto o non piu' valido (es. password cambiata): si esce e, se era
    // una lettura, la si ripete senza token. Le pagine pubbliche restano visibili.
    if (risposta.status === 401 && tokenInviato) {
      token = null
      alNonAutenticato()
      if (metodo === 'GET') return chiama(percorso, { metodo, segnale, anonima: true })
    }
    throw new ErroreApi(risposta.status, dati.messaggio || `Errore ${risposta.status}`, dati.dettagli || [])
  }
  return risposta.status === 204 ? undefined : risposta.json()
}

/** Solo i parametri valorizzati finiscono nella query string. */
function query(parametri) {
  const qs = new URLSearchParams()
  for (const [chiave, valore] of Object.entries(parametri)) {
    if (valore !== undefined && valore !== null && valore !== '') qs.set(chiave, valore)
  }
  const testo = qs.toString()
  return testo ? `?${testo}` : ''
}

const id = (valore) => encodeURIComponent(valore)

export const api = {
  // autenticazione
  login: (email, password) => chiama('/api/auth/login', { metodo: 'POST', corpo: { email, password } }),
  registrazione: (dati) => chiama('/api/auth/registrazione', { metodo: 'POST', corpo: dati }),
  passwordDimenticata: (email) => chiama('/api/auth/password-dimenticata', { metodo: 'POST', corpo: { email } }),
  reimpostaPassword: (token, nuovaPassword) =>
    chiama('/api/auth/reimposta-password', { metodo: 'POST', corpo: { token, nuovaPassword } }),

  // profilo
  profilo: () => chiama('/api/me'),
  aggiornaProfilo: (nome, cognome) => chiama('/api/me', { metodo: 'PUT', corpo: { nome, cognome } }),
  eliminaAccount: () => chiama('/api/me', { metodo: 'DELETE' }),

  // pannello admin
  statistiche: () => chiama('/api/admin/auto/statistiche'),
  adminAuto: (parametri, segnale) => chiama(`/api/admin/auto${query(parametri)}`, { segnale }),
  adminDettaglio: (autoId) => chiama(`/api/admin/auto/${id(autoId)}`),
  creaAuto: (dati) => chiama('/api/admin/auto', { metodo: 'POST', corpo: dati }),
  aggiornaAuto: (autoId, dati) => chiama(`/api/admin/auto/${id(autoId)}`, { metodo: 'PUT', corpo: dati }),
  cambiaPrezzo: (autoId, prezzo) => chiama(`/api/admin/auto/${id(autoId)}/prezzo`, { metodo: 'PATCH', corpo: { prezzo } }),
  pubblica: (autoId) => chiama(`/api/admin/auto/${id(autoId)}/pubblica`, { metodo: 'POST' }),
  bozza: (autoId) => chiama(`/api/admin/auto/${id(autoId)}/bozza`, { metodo: 'POST' }),

  // catalogo pubblico
  cercaAuto: (parametri, segnale) => chiama(`/api/auto${query(parametri)}`, { segnale }),
  dettaglioAuto: (id) => chiama(`/api/auto/${encodeURIComponent(id)}`),

  // preferiti e avvisi dell'utente collegato
  preferiti: () => chiama('/api/preferiti'),
  aggiungiPreferito: (autoId) => chiama('/api/preferiti', { metodo: 'POST', corpo: { autoId } }),
  rimuoviPreferito: (id) => chiama(`/api/preferiti/${encodeURIComponent(id)}`, { metodo: 'DELETE' }),
  avvisi: () => chiama('/api/avvisi'),
  creaAvviso: (autoId, soglia) => chiama('/api/avvisi', { metodo: 'POST', corpo: { autoId, soglia } }),
  aggiornaAvviso: (id, soglia) => chiama(`/api/avvisi/${encodeURIComponent(id)}`, { metodo: 'PUT', corpo: { soglia } }),
  eliminaAvviso: (id) => chiama(`/api/avvisi/${encodeURIComponent(id)}`, { metodo: 'DELETE' }),
  // Link della mail: pubblico, il token casuale monouso e' la prova.
  disattivaAvviso: (token) => chiama('/api/avvisi/disattiva', { metodo: 'POST', corpo: { token } }),
}
