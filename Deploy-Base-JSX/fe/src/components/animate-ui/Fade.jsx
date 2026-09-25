/*
 * Fade / Fades – da Animate UI (primitives/effects/fade).
 * Copyright (c) 2025 Elliot Sutton. Licenza MIT + Commons Clause.
 * Adattato: JSX, senza Slot/asChild, con un piccolo spostamento verticale
 * (`sposta`) e fermo con prefers-reduced-motion.
 */
import { Children } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { useIsInView } from '@/components/animate-ui/useIsInView'

export function Fade({
  children,
  delay = 0,
  sposta = 16,
  inView = false,
  inViewMargin = '0px',
  transition = { type: 'spring', stiffness: 200, damping: 20 },
  ...props
}) {
  const fermo = useReducedMotion()
  const { ref, isInView } = useIsInView({ inView, inViewMargin })
  if (fermo) return <div {...props}>{children}</div>
  return (
    <motion.div
      ref={ref}
      initial="nascosto"
      animate={isInView ? 'visibile' : 'nascosto'}
      variants={{ nascosto: { opacity: 0, y: sposta }, visibile: { opacity: 1, y: 0 } }}
      transition={{ ...transition, delay: (transition.delay ?? 0) + delay / 1000 }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

/** Piu' elementi che entrano uno dopo l'altro: ritardo `delay + indice * holdDelay` ms. */
export function Fades({ children, delay = 0, holdDelay = 60, className, ...props }) {
  return Children.toArray(children).map((figlio, i) => (
    <Fade key={figlio.key ?? i} delay={delay + i * holdDelay} className={className} {...props}>
      {figlio}
    </Fade>
  ))
}
