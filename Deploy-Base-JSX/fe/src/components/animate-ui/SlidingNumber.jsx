/*
 * Sliding Number – da Animate UI (primitives/texts/sliding-number).
 * Copyright (c) 2025 Elliot Sutton. Licenza MIT + Commons Clause.
 * Porting semplificato in JSX: solo interi con separatore delle migliaia,
 * altezza della cifra misurata con ResizeObserver (niente react-use-measure),
 * fermo con prefers-reduced-motion.
 */
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { motion, useReducedMotion, useSpring, useTransform } from 'motion/react'

function useAltezza() {
  const ref = useRef(null)
  const [altezza, setAltezza] = useState(0)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const misura = () => setAltezza(el.getBoundingClientRect().height)
    misura()
    const ro = new ResizeObserver(misura)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, altezza]
}

function Cifra({ valore, altezza, numero }) {
  const y = useTransform(valore, (v) => {
    if (!altezza) return 0
    const offset = (10 + numero - (v % 10)) % 10
    let spostamento = offset * altezza
    if (offset > 5) spostamento -= 10 * altezza
    return spostamento
  })
  return (
    <motion.span style={{ y, position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {numero}
    </motion.span>
  )
}

/** Una "rotella" 0-9 per la cifra in posizione `posto` (1, 10, 100...). */
function Rotella({ numero, posto, transition }) {
  const cifra = Math.floor(numero / posto) % 10
  const valore = useSpring(cifra, transition)
  const [ref, altezza] = useAltezza()

  useEffect(() => {
    valore.set(cifra)
  }, [cifra, valore])

  return (
    <span
      ref={ref}
      style={{ position: 'relative', display: 'inline-block', width: '1ch', overflowY: 'clip', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}
    >
      <span style={{ visibility: 'hidden' }}>0</span>
      {Array.from({ length: 10 }, (_, i) => (
        <Cifra key={i} valore={valore} altezza={altezza} numero={i} />
      ))}
    </span>
  )
}

/**
 * Numero intero le cui cifre scorrono (come un contachilometri) quando cambia.
 * Es. un prezzo che passa da 14.700 a 13.500 dopo la modifica dell'admin.
 */
export default function SlidingNumber({
  number,
  prefisso = '',
  separatoreMigliaia = '.',
  transition = { stiffness: 200, damping: 20, mass: 0.4 },
  ...props
}) {
  const fermo = useReducedMotion()
  const intero = Math.round(Math.abs(Number(number)))
  const testo = String(intero)

  if (fermo) {
    return (
      <span {...props}>
        {prefisso}
        {new Intl.NumberFormat('it-IT').format(intero)}
      </span>
    )
  }

  const posti = Array.from({ length: testo.length }, (_, i) => 10 ** (testo.length - i - 1))
  return (
    <span data-slot="sliding-number" aria-label={`${prefisso}${new Intl.NumberFormat('it-IT').format(intero)}`} style={{ display: 'inline-flex', alignItems: 'center' }} {...props}>
      <span aria-hidden="true" style={{ display: 'inline-flex', alignItems: 'center' }}>
        {prefisso}
        {posti.map((posto, i) => {
          const aDestra = posti.length - i - 1
          return (
            <span key={posto} style={{ display: 'inline-flex' }}>
              <Rotella numero={intero} posto={posto} transition={transition} />
              {aDestra > 0 && aDestra % 3 === 0 && <span>{separatoreMigliaia}</span>}
            </span>
          )
        })}
      </span>
    </span>
  )
}
