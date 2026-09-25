import { Suspense, lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import Layout from '@/components/Layout'
import { RichiedeAdmin, RichiedeLogin } from '@/components/RotteProtette'

// Ogni pagina e' un file a parte: chi apre la Home non scarica admin, privacy, ecc.
const Home = lazy(() => import('@/pages/Home'))
const Catalogo = lazy(() => import('@/pages/Catalogo'))
const DettaglioAuto = lazy(() => import('@/pages/DettaglioAuto'))
const Preferiti = lazy(() => import('@/pages/Preferiti'))
const Avvisi = lazy(() => import('@/pages/Avvisi'))
const DisattivaAvviso = lazy(() => import('@/pages/DisattivaAvviso'))
const Profilo = lazy(() => import('@/pages/Profilo'))
const NonTrovata = lazy(() => import('@/pages/NonTrovata'))
const Login = lazy(() => import('@/pages/auth/Login'))
const Registrazione = lazy(() => import('@/pages/auth/Registrazione'))
const PasswordDimenticata = lazy(() => import('@/pages/auth/PasswordDimenticata'))
const ReimpostaPassword = lazy(() => import('@/pages/auth/ReimpostaPassword'))
const Privacy = lazy(() => import('@/pages/legale/Privacy'))
const Cookie = lazy(() => import('@/pages/legale/Cookie'))
const AdminLayout = lazy(() => import('@/components/admin/AdminLayout'))
const GestioneAnnunci = lazy(() => import('@/pages/admin/GestioneAnnunci'))

function Caricamento() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center" role="status" aria-label="Caricamento">
      <span className="h-8 w-8 animate-spin rounded-full border-4 border-surface-container-high border-t-secondary" />
    </div>
  )
}

/** Ogni URL -> una pagina. Sito pubblico con header/footer, admin con la sua sidebar. */
export default function App() {
  return (
    <Suspense fallback={<Caricamento />}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="catalogo" element={<Catalogo />} />
          <Route path="auto/:id" element={<DettaglioAuto />} />
          <Route path="login" element={<Login />} />
          <Route path="registrazione" element={<Registrazione />} />
          <Route path="password-dimenticata" element={<PasswordDimenticata />} />
          <Route path="reimposta-password" element={<ReimpostaPassword />} />
          {/* link nelle mail: pubblico, il token casuale fa da prova */}
          <Route path="avvisi/disattiva" element={<DisattivaAvviso />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="cookie" element={<Cookie />} />

          <Route element={<RichiedeLogin />}>
            <Route path="preferiti" element={<Preferiti />} />
            <Route path="avvisi" element={<Avvisi />} />
            <Route path="profilo" element={<Profilo />} />
          </Route>

          <Route path="*" element={<NonTrovata />} />
        </Route>

        <Route path="admin" element={<RichiedeAdmin />}>
          <Route element={<AdminLayout />}>
            <Route index element={<GestioneAnnunci />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  )
}
