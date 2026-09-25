import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

/** Header e footer fissi; la pagina della rotta corrente va in <Outlet />. */
export default function Layout() {
  const { pathname } = useLocation()
  // Nuova pagina: si riparte dall'alto (i cambi di filtro nella stessa pagina no).
  useEffect(() => window.scrollTo(0, 0), [pathname])

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      {/* 80px di header + ~34px della barra sotto */}
      <main className="w-full flex-1 pt-[7.25rem]">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
