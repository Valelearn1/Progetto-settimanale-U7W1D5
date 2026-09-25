import { Link } from 'react-router-dom'
import Documento, { Sezione, Tabella } from '@/components/Documento'

/**
 * Privacy Policy di QUESTA applicazione: ogni dato elencato e' davvero salvato
 * (tabelle utenti, preferiti, avvisi, token_password) e nessun altro.
 */
export default function Privacy() {
  return (
    <Documento sopratitolo="Informativa ai sensi del GDPR (Reg. UE 2016/679)" titolo="Privacy Policy" aggiornato="25 settembre 2026">
      <p>
        Questa pagina spiega quali dati personali raccoglie il sito <strong>Mole Motors</strong>, perché, per quanto
        tempo li conserva e come puoi esercitare i tuoi diritti. Mole Motors è un progetto didattico: lo showroom e i
        veicoli sono dimostrativi.
      </p>

      <Sezione titolo="Chi tratta i dati">
        <p>
          Titolare del trattamento è Mole Motors, Corso Giulio Cesare 250, 10155 Torino. Per qualsiasi richiesta sui
          tuoi dati scrivi a <strong>privacy@molemotors.it</strong> (indirizzo dimostrativo del progetto).
        </p>
      </Sezione>

      <Sezione titolo="Quali dati raccogliamo e perché">
        <p>Raccogliamo solo quello che serve al funzionamento del sito. Chi consulta il catalogo senza account non ci lascia nessun dato personale.</p>
        <Tabella
          intestazioni={['Dato', 'A cosa serve', 'Per quanto lo teniamo']}
          righe={[
            ['Nome e cognome', 'Salutarti nel sito e nelle mail', 'Finché hai un account'],
            ['Email', 'Accesso, link per reimpostare la password, avvisi di prezzo', 'Finché hai un account'],
            ['Password', 'Accesso. La salviamo solo cifrata (BCrypt): nessuno può leggerla', 'Finché hai un account'],
            ['Data di registrazione e dell’ultimo cambio password', 'Sicurezza: un cambio password chiude le sessioni aperte', 'Finché hai un account'],
            ['Auto preferite', 'Mostrarti le auto che segui', 'Finché le togli o elimini l’account'],
            ['Avvisi di prezzo (auto e soglia)', 'Mandarti una mail quando il prezzo scende sotto la soglia', 'Finché li togli o elimini l’account'],
            ['Codice del link di disattivazione avviso', 'Disattivare un avviso dalla mail, una volta sola. Ne salviamo solo un’impronta (hash)', 'Finché l’avviso esiste; si cancella dopo l’uso'],
            ['Codice del link di reset password', 'Reimpostare la password. Anche qui solo l’impronta (hash)', 'Vale 120 minuti; cancellato ogni notte se usato o scaduto'],
          ]}
        />
        <p>
          Non raccogliamo dati di navigazione per statistiche o pubblicità e non profiliamo gli utenti. I registri
          tecnici del server riportano solo il numero identificativo dell’account, mai email o password.
        </p>
      </Sezione>

      <Sezione titolo="Su quale base">
        <p>
          Trattiamo i dati per fornirti il servizio che chiedi registrandoti (art. 6.1.b GDPR): account, preferiti e
          avvisi di prezzo. Le mail degli avvisi partono solo per le auto e le soglie che hai scelto tu.
        </p>
      </Sezione>

      <Sezione titolo="A chi arrivano i dati">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Render</strong> (hosting del sito e del database, regione di Francoforte, UE).
          </li>
          <li>
            <strong>Google (Gmail)</strong>, usato solo per spedire le mail di reset password e di avviso prezzo: riceve
            il tuo indirizzo e il testo del messaggio.
          </li>
        </ul>
        <p>
          Non vendiamo né cediamo i dati ad altri. Per i contenuti caricati da servizi esterni (font e foto dei veicoli)
          vedi la <Link to="/cookie" className="font-semibold text-secondary underline">Cookie Policy</Link>.
        </p>
      </Sezione>

      <Sezione titolo="I tuoi diritti">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Accesso e rettifica</strong>: nome, cognome ed email sono visibili nel{' '}
            <Link to="/profilo" className="font-semibold text-secondary underline">profilo</Link>, dove puoi correggere nome e cognome.
          </li>
          <li>
            <strong>Cancellazione</strong>: dal profilo, «Elimina il mio account» cancella subito account, preferiti,
            avvisi e codici di reset. Da quel momento non parte più nessuna mail.
          </li>
          <li>
            <strong>Opposizione agli avvisi</strong>: ogni mail di avviso contiene un link per disattivarlo; puoi anche
            eliminarlo dalla pagina <Link to="/avvisi" className="font-semibold text-secondary underline">Avvisi Prezzo</Link>.
          </li>
          <li>
            <strong>Portabilità, limitazione e reclamo</strong>: scrivi all’indirizzo sopra; puoi sempre rivolgerti al
            Garante per la protezione dei dati personali (garanteprivacy.it).
          </li>
        </ul>
      </Sezione>
    </Documento>
  )
}
