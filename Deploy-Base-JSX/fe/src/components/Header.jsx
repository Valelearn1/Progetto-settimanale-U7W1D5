import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'
import Logo from '@/components/Logo'
import ToggleTema from '@/components/ToggleTema'
import manager from '@/assets/manager.jpg'

const classeVoce = ({ isActive }) =>
  isActive
    ? 'whitespace-nowrap px-space-md py-2 rounded-lg bg-primary-container text-on-secondary text-label-md font-semibold'
    : 'whitespace-nowrap px-space-md py-2 rounded-lg text-label-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors'

const classeVoceMobile = ({ isActive }) =>
  isActive
    ? 'flex items-center gap-3 rounded-lg bg-primary-container px-space-md py-3 text-label-md font-semibold text-on-secondary'
    : 'flex items-center gap-3 rounded-lg px-space-md py-3 text-label-md text-on-surface hover:bg-surface-container'

function Avatar({ utente, isAdmin }) {
  return isAdmin ? (
    <img src={manager} alt="" className="h-8 w-8 rounded-full object-cover" />
  ) : (
    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary-fixed text-label-md font-semibold text-on-secondary-fixed">
      {utente ? utente.nome.charAt(0).toUpperCase() : ''}
    </span>
  )
}

export default function Header() {
  const { collegato, utente, isAdmin, esci } = useAuth()
  const navigate = useNavigate()
  const { pathname, search } = useLocation()
  const [ricerca, setRicerca] = useState('')
  const [menuAperto, setMenuAperto] = useState(false)

  // Cambiando pagina il menu mobile si chiude.
  useEffect(() => setMenuAperto(false), [pathname, search])

  // Il campo mostra la ricerca in corso nel catalogo; altrove resta vuoto.
  useEffect(() => {
    setRicerca(pathname === '/' ? (new URLSearchParams(search).get('q') ?? '') : '')
  }, [pathname, search])

  function cerca(e) {
    e.preventDefault()
    const testo = ricerca.trim()
    navigate(testo ? `/?q=${encodeURIComponent(testo)}` : '/')
  }

  function logout() {
    esci()
    navigate('/')
  }

  const voci = [
    { to: '/', etichetta: 'Catalogo Auto', icona: 'directions_car', end: true },
    { to: '/preferiti', etichetta: 'I miei Preferiti', icona: 'favorite' },
    { to: '/avvisi', etichetta: 'Avvisi Prezzo', icona: 'notifications_active' },
  ]

  const campoRicerca = (classe) => (
    <form onSubmit={cerca} className={`items-center rounded-full bg-surface-container-low px-space-md py-1.5 ${classe}`}>
      <span className="icona mr-space-xs text-lg text-outline">search</span>
      <input
        value={ricerca}
        onChange={(e) => setRicerca(e.target.value)}
        maxLength={100}
        type="search"
        placeholder="Cerca marca o modello..."
        aria-label="Cerca nel catalogo"
        className="w-full border-0 bg-transparent text-body-sm text-on-surface placeholder:text-outline focus:outline-none xl:w-56"
      />
    </form>
  )

  return (
    <header className="fixed top-0 z-40 w-full bg-surface/90 shadow-[0_1px_8px_rgba(0,0,0,0.04)] backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-space-md px-4 sm:px-margin">
        <div className="flex items-center gap-space-lg">
          <Link to="/" className="flex shrink-0 items-center gap-space-sm">
            <Logo className="h-8 w-auto sm:h-9" />
          </Link>
          {campoRicerca('hidden xl:flex')}
        </div>

        <nav className="hidden items-center gap-space-xs lg:flex" aria-label="Navigazione principale">
          {voci.map((v) => (
            <NavLink key={v.to} to={v.to} end={v.end} className={classeVoce}>
              {v.etichetta}
            </NavLink>
          ))}
          {isAdmin && (
            <NavLink
              to="/admin"
              className="ml-space-sm whitespace-nowrap rounded-full bg-secondary-fixed px-space-md py-1.5 text-label-sm uppercase tracking-wide text-on-secondary-fixed transition-all hover:bg-secondary hover:text-on-secondary"
            >
              Area Admin
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-space-xs sm:gap-space-sm">
          <ToggleTema />
          {collegato ? (
            <>
              <Link to="/profilo" className="flex items-center gap-space-sm rounded-lg p-1 hover:bg-surface-container">
                <Avatar utente={utente} isAdmin={isAdmin} />
                <span className="hidden flex-col text-left md:flex lg:hidden xl:flex">
                  <span className="text-label-md leading-tight text-on-surface">
                    {utente ? `${utente.nome} ${utente.cognome}` : ''}
                  </span>
                  <span className="text-label-sm font-semibold uppercase tracking-wider text-secondary">
                    {isAdmin ? 'Amministratore' : 'Cliente'}
                  </span>
                </span>
              </Link>
              <button
                type="button"
                onClick={logout}
                aria-label="Esci"
                title="Esci"
                className="hidden rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface sm:block"
              >
                <span className="icona text-xl">logout</span>
              </button>
            </>
          ) : (
            <div className="hidden items-center gap-space-sm sm:flex">
              <Link
                to="/login"
                className="rounded-lg px-space-md py-2 text-label-md font-semibold text-on-surface transition-colors hover:bg-surface-container"
              >
                Accedi
              </Link>
              <Link
                to="/registrazione"
                className="rounded-lg bg-primary px-space-md py-2 text-label-md font-semibold text-on-primary shadow-sm transition-colors hover:bg-primary-container"
              >
                Registrati
              </Link>
            </div>
          )}
          <button
            type="button"
            onClick={() => setMenuAperto((a) => !a)}
            aria-expanded={menuAperto}
            aria-controls="menu-mobile"
            aria-label={menuAperto ? 'Chiudi menu' : 'Apri menu'}
            className="rounded-lg p-2 text-on-surface transition-colors hover:bg-surface-container lg:hidden"
          >
            <span className="icona text-2xl">{menuAperto ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      {menuAperto && (
        <div id="menu-mobile" className="border-t border-surface-container bg-surface-container-lowest px-4 pb-space-md shadow-lg sm:px-margin lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-space-xs pt-space-md">
            {campoRicerca('flex mb-space-sm')}
            {voci.map((v) => (
              <NavLink key={v.to} to={v.to} end={v.end} className={classeVoceMobile}>
                <span className="icona text-xl">{v.icona}</span>
                {v.etichetta}
              </NavLink>
            ))}
            {isAdmin && (
              <NavLink to="/admin" className={classeVoceMobile}>
                <span className="icona text-xl">admin_panel_settings</span>
                Area Admin
              </NavLink>
            )}
            <div className="mt-space-sm border-t border-surface-container pt-space-sm">
              {collegato ? (
                <div className="flex flex-col gap-space-xs">
                  <NavLink to="/profilo" className={classeVoceMobile}>
                    <span className="icona text-xl">person</span>
                    Il mio profilo
                  </NavLink>
                  <button type="button" onClick={logout} className="flex items-center gap-3 rounded-lg px-space-md py-3 text-left text-label-md text-error hover:bg-surface-container">
                    <span className="icona text-xl">logout</span>
                    Esci
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-space-sm">
                  <Link to="/login" className="rounded-lg bg-surface-container px-space-md py-2.5 text-center text-label-md font-semibold text-on-surface">
                    Accedi
                  </Link>
                  <Link to="/registrazione" className="rounded-lg bg-primary px-space-md py-2.5 text-center text-label-md font-semibold text-on-primary">
                    Registrati
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="bg-surface-container-low px-4 py-2 shadow-[0_1px_4px_rgba(0,0,0,0.02)] sm:px-margin">
        <div className="mx-auto flex max-w-7xl items-center justify-between text-label-sm text-on-surface-variant">
          <div className="flex items-center gap-space-xs">
            <span className="text-outline">Showroom Torino</span>
            <span className="text-outline">/</span>
            <span className="font-semibold text-on-surface">Inventario Ufficiale Veloce</span>
          </div>
          <span className="hidden sm:inline">Aggiornato oggi</span>
        </div>
      </div>
    </header>
  )
}
