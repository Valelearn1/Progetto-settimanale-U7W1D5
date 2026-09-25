#!/usr/bin/env bash
# Avvio locale per macOS/Linux (equivalente di avvia.cmd).
# BE in background, FE in primo piano: Ctrl+C chiude entrambi.
cd "$(dirname "$0")" || exit 1

# ---------- Porte: FE sempre sulla 5173, BE sulla 8080 ----------
# Se un processo (es. un vecchio npm run dev) le occupa, lo si chiude.
libera_porta() {
  local porta=$1
  local pid
  pid=$(lsof -ti tcp:"$porta" -sTCP:LISTEN 2>/dev/null)
  if [ -n "$pid" ]; then
    echo "[porta $porta] occupata da PID $pid: la libero."
    kill $pid 2>/dev/null
    sleep 1
    pid=$(lsof -ti tcp:"$porta" -sTCP:LISTEN 2>/dev/null)
    [ -n "$pid" ] && kill -9 $pid 2>/dev/null
  fi
}
libera_porta 5173
libera_porta 8080

# ---------- PostgreSQL: serve il database salone_auto sulla 5432 ----------
if nc -z localhost 5432 >/dev/null 2>&1; then
  echo "[postgres] in ascolto sulla 5432."
else
  echo "[postgres] porta 5432 chiusa: il backend non partira'."
  echo "           createdb -U postgres salone_auto"
fi

# Dipendenze FE solo al primo avvio
if [ ! -d fe/node_modules ]; then
  echo "[FE] npm install..."
  (cd fe && npm install) || exit 1
fi

# ---------- Credenziali di prova (SOLO locale, vedi README) ----------
# Si possono sovrascrivere dall'esterno; su Render queste variabili non esistono.
export ADMIN_EMAIL="${ADMIN_EMAIL:-admin@velocemotors.it}"
export ADMIN_PASSWORD="${ADMIN_PASSWORD:-AdminVeloce2026}"
export DEMO_EMAIL="${DEMO_EMAIL:-prova.catalogo@esempio.it}"
export DEMO_PASSWORD="${DEMO_PASSWORD:-ProvaCatalogo1}"
# Senza Gmail configurato, i link delle mail (reset, disattiva avviso) finiscono nel log.
export APP_MAIL_LOG_LINK="${APP_MAIL_LOG_LINK:-true}"

# Backend in background; all'uscita si chiude tutto il gruppo di processi
# (anche la JVM che spring-boot:run avvia come processo figlio)
trap 'kill 0 2>/dev/null' EXIT
(cd be && sh ./mvnw spring-boot:run) &

echo
echo " Applicazione : http://localhost:5173"
echo " Stato        : http://localhost:8080/api/stato"
echo " Salute       : http://localhost:8080/actuator/health"
echo

# Frontend in primo piano
cd fe && npm run dev
