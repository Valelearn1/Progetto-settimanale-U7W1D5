import { Link, Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'

/**
 * Protezioni dell'interfaccia: evitano di mostrare pagine inutili a chi non
 * puo' usarle. La sicurezza vera e' sul server, che risponde 401/403/404.
 */
export function RichiedeLogin() {
  const { collegato } = useAuth()
  const location = useLocation()
  if (!collegato) {
    return <Navigate to="/login" replace state={{ da: location.pathname + location.search }} />
  }
  return <Outlet />
}

export function RichiedeAdmin() {
  const { collegato, isAdmin } = useAuth()
  const location = useLocation()
  if (!collegato) {
    return <Navigate to="/login" replace state={{ da: location.pathname + location.search }} />
  }
  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-space-md bg-surface px-4 text-center">
        <span className="icona text-5xl text-error">block</span>
        <h1 className="font-display text-headline-md text-on-surface">Accesso negato</h1>
        <p className="text-body-md text-on-surface-variant">Questa area è riservata agli amministratori.</p>
        <Link to="/catalogo" className="rounded-lg bg-primary px-space-md py-2 text-label-md font-semibold text-on-primary">
          Torna al catalogo
        </Link>
      </div>
    )
  }
  return <Outlet />
}
