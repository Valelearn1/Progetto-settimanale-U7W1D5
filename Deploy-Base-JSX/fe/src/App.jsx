import { Route, Routes } from 'react-router-dom'
import Layout from '@/components/Layout'
import AdminLayout from '@/components/admin/AdminLayout'
import { RichiedeAdmin, RichiedeLogin } from '@/components/RotteProtette'
import Catalogo from '@/pages/Catalogo'
import DettaglioAuto from '@/pages/DettaglioAuto'
import Preferiti from '@/pages/Preferiti'
import Avvisi from '@/pages/Avvisi'
import DisattivaAvviso from '@/pages/DisattivaAvviso'
import Profilo from '@/pages/Profilo'
import NonTrovata from '@/pages/NonTrovata'
import Login from '@/pages/auth/Login'
import Registrazione from '@/pages/auth/Registrazione'
import PasswordDimenticata from '@/pages/auth/PasswordDimenticata'
import ReimpostaPassword from '@/pages/auth/ReimpostaPassword'
import GestioneAnnunci from '@/pages/admin/GestioneAnnunci'

/** Ogni URL -> una pagina. Sito pubblico con header/footer, admin con la sua sidebar. */
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Catalogo />} />
        <Route path="auto/:id" element={<DettaglioAuto />} />
        <Route path="login" element={<Login />} />
        <Route path="registrazione" element={<Registrazione />} />
        <Route path="password-dimenticata" element={<PasswordDimenticata />} />
        <Route path="reimposta-password" element={<ReimpostaPassword />} />
        {/* link nelle mail: pubblico, il token casuale fa da prova */}
        <Route path="avvisi/disattiva" element={<DisattivaAvviso />} />

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
  )
}
