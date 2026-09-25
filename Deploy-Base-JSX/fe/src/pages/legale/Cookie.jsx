import { Link } from 'react-router-dom'
import Documento, { Sezione, Tabella } from '@/components/Documento'

/** Cookie Policy: cosa resta nel browser e perche', token compreso (anche se sta nel localStorage). */
export default function Cookie() {
  return (
    <Documento sopratitolo="Cosa resta nel tuo browser" titolo="Cookie Policy" aggiornato="25 settembre 2026">
      <p>
        Il sito <strong>non usa cookie</strong>: né tecnici, né di statistica, né pubblicitari. Per funzionare salva
        però due informazioni nel <strong>localStorage</strong> del browser, uno spazio simile ai cookie che resta sul
        tuo dispositivo e non viene inviato automaticamente al server.
      </p>

      <Sezione titolo="Cosa salviamo nel browser">
        <Tabella
          intestazioni={['Nome', 'Cosa contiene', 'Perché', 'Quando sparisce']}
          righe={[
            [
              'salone.token',
              'Il codice di accesso (JWT) con il numero del tuo account e il ruolo. Nessuna email, nessuna password.',
              'Tenerti collegato mentre navighi. Viene allegato solo alle richieste verso il nostro server.',
              'Quando esci, dopo 2 ore o quando cambi password. Esiste solo se hai fatto l’accesso.',
            ],
            [
              'salone.tema',
              'La scelta tra tema chiaro e scuro.',
              'Ricordare la tua preferenza.',
              'Quando cancelli i dati del sito dal browser.',
            ],
          ]}
        />
        <p>
          Entrambe sono necessarie al servizio che chiedi (restare collegato, vedere il tema che hai scelto): per questo
          non chiediamo un consenso. Non servono a seguirti su altri siti.
        </p>
      </Sezione>

      <Sezione titolo="Contenuti caricati da servizi esterni">
        <p>Per mostrare le pagine il browser scarica alcuni file da altri siti, che ricevono il tuo indirizzo IP come in ogni richiesta web:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Google Fonts</strong> (fonts.googleapis.com, fonts.gstatic.com): i caratteri Inter e Plus Jakarta
            Sans e le icone.
          </li>
          <li>
            <strong>Wikimedia Commons</strong> (thumb.wikimedia.org): le foto dei veicoli, pubblicate con licenze libere
            Creative Commons.
          </li>
        </ul>
        <p>Nessuno di questi servizi riceve da noi i tuoi dati di account.</p>
      </Sezione>

      <Sezione titolo="Come cancellarli">
        <p>
          Il codice di accesso si cancella con «Esci». Per togliere anche la preferenza del tema usa la funzione del
          browser per cancellare i dati dei siti (in Chrome: Impostazioni › Privacy e sicurezza › Cookie e altri dati
          dei siti). Per i dati salvati sul server vedi la{' '}
          <Link to="/privacy" className="font-semibold text-secondary underline">Privacy Policy</Link>.
        </p>
      </Sezione>
    </Documento>
  )
}
