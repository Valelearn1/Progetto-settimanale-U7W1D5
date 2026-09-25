import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'
import Logo from '@/components/Logo'
import ToggleTema from '@/components/ToggleTema'
import manager from '@/assets/manager.jpg'

const classeVoce = ({ isActive }) =>
  `flex items-center gap-space-sm rounded-lg px-space-md py-2.5 text-label-md transition-all ${
    isActive
      ? 'bg-primary-container font-semibold text-on-secondary'
      : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
  }`

/** Layout del pannello admin (design Stitch "Gestione Annunci"): sidebar + contenuto. */
export default function AdminLayout() {
  const { utente, esci } = useAuth()
  const navigate = useNavigate()
  const { pathname, search } = useLocation()
  const [menuAperto, setMenuAperto] = useState(false)
  useEffect(() => setMenuAperto(false), [pathname, search])

  const sidebar = (
    <div className="flex h-full flex-col justify-between py-space-md">
      <div className="flex flex-col">
        <Link to="/admin" className="flex items-center gap-space-sm px-space-md pb-space-lg">
          <Logo className="h-8 w-auto" />
        </Link>
        <span className="mb-space-sm px-space-md text-label-sm uppercase tracking-wider text-outline">Gestione Showroom</span>
        <nav className="space-y-1 px-space-sm" aria-label="Menu amministrazione">
          <NavLink to="/admin" end className={classeVoce}>
            <span className="icona text-lg">directions_car</span> Inventario Annunci
          </NavLink>
          <NavLink to="/admin?nuovo=1" className={() => classeVoce({ isActive: false })}>
            <span className="icona text-lg">add_circle</span> Pubblica Auto
          </NavLink>
          <NavLink to="/" className={classeVoce}>
            <span className="icona text-lg">visibility</span> Torna al Sito
          </NavLink>
        </nav>
      </div>
      <div className="px-space-md">
        <div className="flex items-center gap-space-sm rounded-xl bg-surface-container p-space-sm">
          <img src={manager} alt="" className="h-8 w-8 rounded-full object-cover" />
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-label-md text-on-surface">{utente ? `${utente.nome} ${utente.cognome}` : ''}</span>
            <span className="truncate text-label-sm text-secondary">Amministratore</span>
          </div>
          <button
            type="button"
            onClick={() => {
              esci()
              navigate('/')
            }}
            aria-label="Esci"
            title="Esci"
            className="rounded-full p-1.5 text-on-surface-variant hover:bg-surface-container-high"
          >
            <span className="icona text-lg">logout</span>
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-surface">
      {/* desktop: sidebar fissa */}
      <aside className="fixed top-0 left-0 z-40 hidden h-full w-64 bg-surface-container-low shadow-[0_1px_8px_rgba(0,0,0,0.04)] lg:block">
        {sidebar}
      </aside>

      {/* mobile/tablet: barra in alto + menu a scomparsa */}
      <header className="fixed top-0 right-0 left-0 z-40 flex h-16 items-center justify-between bg-surface/90 px-4 shadow-[0_1px_8px_rgba(0,0,0,0.04)] backdrop-blur-xl lg:left-64 lg:px-space-lg">
        <button
          type="button"
          onClick={() => setMenuAperto(true)}
          aria-label="Apri menu"
          className="rounded-lg p-2 hover:bg-surface-container lg:hidden"
        >
          <span className="icona text-2xl">menu</span>
        </button>
        <span className="font-display text-title-md text-on-surface">Pannello Amministrazione Showroom</span>
        <div className="flex items-center gap-space-sm">
          <span className="hidden items-center gap-space-xs rounded-lg bg-surface-container-low px-space-sm py-1 text-label-sm text-on-surface-variant sm:flex">
            <span className="icona text-sm text-outline">storefront</span> Sede Torino
          </span>
          <ToggleTema />
        </div>
      </header>
      {menuAperto && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu amministrazione">
          <div className="absolute inset-0 bg-scrim/50" onClick={() => setMenuAperto(false)} />
          <aside className="absolute top-0 left-0 h-full w-72 max-w-[85vw] bg-surface-container-low shadow-xl">
            <button
              type="button"
              onClick={() => setMenuAperto(false)}
              aria-label="Chiudi menu"
              className="absolute top-3 right-3 rounded-lg p-1.5 hover:bg-surface-container"
            >
              <span className="icona">close</span>
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <main className="px-4 pt-20 pb-space-xl sm:px-margin lg:pl-[calc(16rem+2rem)]">
        <Outlet />
      </main>
    </div>
  )
}
