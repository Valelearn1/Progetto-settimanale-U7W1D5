import { Route, Routes } from 'react-router-dom'
import Layout from '@/components/Layout'
import Catalogo from '@/pages/Catalogo'
import InArrivo from '@/pages/InArrivo'

/** Ogni URL -> una pagina. Header e footer li mette Layout. */
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Catalogo />} />
        <Route path="auto/:id" element={<InArrivo titolo="Scheda auto" />} />
        <Route path="login" element={<InArrivo titolo="Accedi" />} />
        <Route path="registrazione" element={<InArrivo titolo="Registrati" />} />
        <Route path="preferiti" element={<InArrivo titolo="I miei Preferiti" />} />
        <Route path="avvisi" element={<InArrivo titolo="Avvisi Prezzo" />} />
        <Route path="admin/*" element={<InArrivo titolo="Pannello Admin" />} />
        <Route path="*" element={<InArrivo titolo="Pagina non trovata" />} />
      </Route>
    </Routes>
  )
}
