# Salone auto – guida per Claude

Mini salone di automobili: catalogo pubblico con ricerca/ordinamento/paginazione,
preferiti e avvisi di prezzo via email per utenti registrati, gestione annunci per l'admin.

## Struttura
- **`Deploy-Base-JSX/`** è il progetto vero: `be/` (Spring Boot) + `fe/` (React) + `render.yaml`.
- `BE/` e `FEJSX/` alla radice sono scheletri iniziali **non usati**: non modificarli.

## Stack
- **be**: Spring Boot 4.1.1, Java 25, Maven wrapper, Spring Data JPA + PostgreSQL, Spring Security
  con OAuth2 Resource Server (JWT HS256), Bean Validation, Spring Mail + Thymeleaf (solo template mail).
  Package `it.epicode.base`: `model`, `repository`, `dto`, `service`, `web`, `security`, `mail`, `errore`, `config`.
- **fe**: React 19, Vite 8, JavaScript (JSX), Tailwind 4, react-router-dom. Alias `@` → `src`.
  Chiamate HTTP solo da `src/lib/api.js`.
- **db**: PostgreSQL locale `salone_auto` (utente `postgres` / `admin`), tabelle create da Hibernate (`ddl-auto: update`).

## Comandi
- Avvio completo: `cd Deploy-Base-JSX && ./avvia.sh` (libera le porte 5173 e 8080 prima di partire).
- Test BE: `cd Deploy-Base-JSX/be && sh ./mvnw test` (H2 in memoria, profilo `test`).
  `mvnw` non ha il bit di esecuzione: usare `sh ./mvnw`.
- Build FE: `cd Deploy-Base-JSX/fe && npm run build`.
- Il FE gira **sempre sulla 5173** (`strictPort: true`); se è occupata va liberata, non si cambia porta.
- Porta 8080 (o 5173) occupata: prima capire da cosa (`lsof -ti tcp:<porta> -sTCP:LISTEN` + `ps -p <pid> -o command=`).
  Se non serve (vecchia istanza di questo progetto, app di un altro progetto del corso rimasta accesa)
  liberarla; se non è chiaro cosa sia, chiedere all'utente prima di chiuderla.

## Variabili d'ambiente (mai valori reali nella repo)
`JWT_SECRET` (≥ 32 byte), `MAIL_USERNAME`, `MAIL_PASSWORD` (password per le app di Gmail),
`ADMIN_EMAIL`, `ADMIN_PASSWORD` (admin creato all'avvio da `AdminSeeder`), `FE_URL` (link nelle mail),
`ALLOWED_ORIGIN` (CORS), `VITE_API_URL` (FE, letta in build), `APP_MAIL_LOG_LINK=true` (solo locale:
stampa i link delle mail nel log quando SMTP non è configurato).

## Regole di sicurezza (requisiti del progetto)
- Input: DTO `record` in ingresso e in uscita, **mai entità**. Campi extra nel JSON (`ruolo`, `inviato`,
  `utenteId`...) non devono cambiare niente.
- Ruolo deciso dal server: la registrazione crea sempre `USER`. Il JWT contiene solo `sub` (id) e `ruolo`.
- L'id dell'utente si legge solo dal JWT (`UtenteCorrente.id(jwt)`), mai da body o path.
- Preferiti e avvisi si cercano con `findByIdAndUtenteId`: risorsa di un altro utente → **404**, non 403.
- `/api/admin/**` solo `ROLE_ADMIN` (regola in `SecurityConfig` + `@PreAuthorize`): utente normale → 403.
- Ricerca con JPA `Specification` (parametri legati, `%` e `_` escapati); `sort` confrontato con la mappa
  chiusa `ORDINAMENTI` in `AutoService`, valore non ammesso → 400. Niente concatenazione di query.
- Link nelle mail: token casuale (`TokenCasuale`), nel DB solo lo SHA-256, monouso. Reset password 120 minuti.
- Template mail Thymeleaf in `be/src/main/resources/templates/mail`: solo `th:text` / `th:href`, mai `th:utext`.
- FE: niente `dangerouslySetInnerHTML`; la descrizione dell'auto si mostra come testo.
- Log: niente password, email, token. Si logga l'id utente.

## Convenzioni
- Nomi di classi, metodi, campi e commenti in **italiano**, come il codice esistente.
- Nuove regole di sicurezza → aggiungere un caso in `be/src/test/java/it/epicode/base/SicurezzaIntegrationTest.java`.

## Modo di lavorare con l'utente
- I commit li scrive e lancia l'utente: proporre solo un messaggio breve.
- Procedere un pezzo per volta e spiegare a cosa serve ogni comando o file.
- Il FE va costruito a partire dal design Stitch fornito dall'utente.
