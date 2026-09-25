import { useRef, useState } from 'react'

/**
 * Carousel della scheda auto: foto grande, frecce, miniature, tastiera
 * (frecce sinistra/destra quando ha il focus) e swipe su touch.
 */
export default function CarouselGrande({ immagini, titolo }) {
  const [indice, setIndice] = useState(0)
  const inizioTocco = useRef(null)
  const totale = immagini.length
  const vai = (delta) => setIndice((i) => (i + delta + totale) % totale)

  if (totale === 0) {
    return (
      <div className="flex aspect-[16/10] items-center justify-center rounded-xl bg-surface-container text-outline">
        <span className="icona text-6xl">directions_car</span>
      </div>
    )
  }

  return (
    <div
      className="flex flex-col gap-space-sm"
      role="region"
      aria-roledescription="carousel"
      aria-label={`Foto di ${titolo}`}
    >
      <div
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') vai(-1)
          if (e.key === 'ArrowRight') vai(1)
        }}
        onTouchStart={(e) => (inizioTocco.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (inizioTocco.current === null) return
          const delta = e.changedTouches[0].clientX - inizioTocco.current
          if (Math.abs(delta) > 40) vai(delta < 0 ? 1 : -1)
          inizioTocco.current = null
        }}
        className="group relative aspect-[16/10] overflow-hidden rounded-xl bg-surface-container shadow-sm focus:ring-2 focus:ring-secondary focus:outline-none"
      >
        <img
          key={immagini[indice]}
          src={immagini[indice]}
          alt={`${titolo} – foto ${indice + 1} di ${totale}`}
          className="h-full w-full object-cover"
        />
        {totale > 1 && (
          <>
            <button
              type="button"
              onClick={() => vai(-1)}
              aria-label="Foto precedente"
              className="absolute top-1/2 left-3 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-surface-container-lowest/90 text-on-surface shadow-md transition-transform hover:scale-105"
            >
              <span className="icona">chevron_left</span>
            </button>
            <button
              type="button"
              onClick={() => vai(1)}
              aria-label="Foto successiva"
              className="absolute top-1/2 right-3 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-surface-container-lowest/90 text-on-surface shadow-md transition-transform hover:scale-105"
            >
              <span className="icona">chevron_right</span>
            </button>
            <span className="absolute right-3 bottom-3 rounded-full bg-primary-container/80 px-2.5 py-1 text-label-sm text-on-secondary backdrop-blur-sm">
              {indice + 1} / {totale}
            </span>
          </>
        )}
      </div>

      {totale > 1 && (
        <div className="grid grid-cols-5 gap-space-sm sm:grid-cols-6">
          {immagini.map((url, i) => (
            <button
              key={url}
              type="button"
              onClick={() => setIndice(i)}
              aria-label={`Mostra foto ${i + 1}`}
              aria-current={i === indice}
              className={`aspect-[4/3] overflow-hidden rounded-lg transition-all ${i === indice ? 'ring-2 ring-secondary' : 'opacity-70 hover:opacity-100'}`}
            >
              <img src={url} alt="" loading="lazy" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
