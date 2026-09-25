/*
 * Counting Number – da Animate UI (primitives/texts/counting-number).
 * Copyright (c) 2025 Elliot Sutton. Licenza MIT + Commons Clause.
 * Adattato: JSX, formato italiano (separatore delle migliaia), fermo con prefers-reduced-motion.
 */
import { useEffect } from 'react'
import { useMotionValue, useReducedMotion, useSpring } from 'motion/react'
import { useIsInView } from '@/components/animate-ui/useIsInView'

const formato = new Intl.NumberFormat('it-IT', { maximumFractionDigits: 0 })

/**
 * Numero che conta da `fromNumber` a `number` con una molla.
 * `inView`: parte solo quando l'elemento entra nello schermo.
 */
export default function CountingNumber({
  number,
  fromNumber = 0,
  prefisso = '',
  suffisso = '',
  inView = false,
  inViewMargin = '0px',
  // Smorzamento critico: arriva al valore esatto in circa un secondo anche sui numeri grandi
  // (con il default di Animate UI, 90/50, un totale come €1.315.200 impiegava troppo).
  transition = { stiffness: 100, damping: 20 },
  delay = 0,
  ...props
}) {
  const fermo = useReducedMotion()
  const { ref, isInView } = useIsInView({ inView, inViewMargin })
  const valore = useMotionValue(fermo ? number : fromNumber)
  const molla = useSpring(valore, transition)

  useEffect(() => {
    const t = setTimeout(() => {
      if (isInView) valore.set(number)
    }, delay)
    return () => clearTimeout(t)
  }, [isInView, number, valore, delay])

  // Scrive direttamente nel DOM a ogni passo: niente re-render di React per ogni frame.
  useEffect(
    () =>
      molla.on('change', (v) => {
        if (ref.current) ref.current.textContent = `${prefisso}${formato.format(Math.round(v))}${suffisso}`
      }),
    [molla, prefisso, suffisso, ref],
  )

  return (
    <span ref={ref} data-slot="counting-number" style={{ fontVariantNumeric: 'tabular-nums' }} {...props}>
      {`${prefisso}${formato.format(fermo ? number : fromNumber)}${suffisso}`}
    </span>
  )
}
