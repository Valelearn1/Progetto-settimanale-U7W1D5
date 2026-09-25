import { Link } from 'react-router-dom'
import Logo from '@/components/Logo'

export default function Footer() {
  return (
    <footer className="w-full bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="mx-auto max-w-7xl px-4 py-space-xl sm:px-margin">
        <div className="mb-space-xl grid grid-cols-1 gap-space-lg md:grid-cols-4">
          <div className="space-y-space-sm">
            <Logo className="h-8 w-auto" />
            <p className="text-body-sm text-on-surface-variant">
              Concessionaria di veicoli nuovi, km 0 e usato garantito, con controlli certificati su ogni vettura.
            </p>
            <p className="text-body-sm text-outline">
              Corso Giulio Cesare 250, 10155 Torino (TO)
              <br />
              +39 011 899 0440
            </p>
          </div>
          <div className="space-y-space-xs">
            <h4 className="mb-space-sm font-display text-title-md text-on-surface">Navigazione Showroom</h4>
            <ul className="space-y-space-xs text-body-sm text-on-surface-variant">
              <li>
                <Link to="/?condizione=NUOVO" className="transition-colors hover:text-secondary">
                  Vetture Nuove
                </Link>
              </li>
              <li>
                <Link to="/?condizione=KM_0" className="transition-colors hover:text-secondary">
                  Km 0
                </Link>
              </li>
              <li>
                <Link to="/?condizione=USATO" className="transition-colors hover:text-secondary">
                  Usato Certificato Veloce
                </Link>
              </li>
              <li>
                <Link to="/avvisi" className="transition-colors hover:text-secondary">
                  Avvisi di prezzo
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-space-xs">
            <h4 className="mb-space-sm font-display text-title-md text-on-surface">Garanzia &amp; Trasparenza</h4>
            <ul className="space-y-space-xs text-body-sm text-on-surface-variant">
              <li>110 Controlli Tecnici Certificati</li>
              <li>Garanzia Europea 24 Mesi Inclusa</li>
              <li>Chilometraggio Contrattuale Garantito</li>
              <li>Soddisfatti o Rimborsati 14 Giorni</li>
            </ul>
          </div>
          <div className="space-y-space-sm">
            <h4 className="font-display text-title-md text-on-surface">Area Riservata</h4>
            <p className="text-body-sm text-on-surface-variant">
              Accesso gestionale per consulenti alle vendite e direzione showroom.
            </p>
            <Link
              to="/admin"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-space-md py-2 text-label-md text-on-primary transition-all hover:bg-surface-container-high hover:text-on-surface"
            >
              Pannello Operativo
            </Link>
          </div>
        </div>
        <div className="flex flex-col items-center justify-between gap-space-sm rounded-xl bg-surface-container-low px-space-lg py-space-md text-label-sm text-outline md:flex-row">
          <p>© {new Date().getFullYear()} Veloce Motors. Progetto didattico.</p>
          <p>Foto dei veicoli: Wikimedia Commons, licenze CC.</p>
        </div>
      </div>
    </footer>
  )
}
