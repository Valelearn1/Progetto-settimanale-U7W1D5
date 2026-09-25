/*
 * useIsInView – da Animate UI (hooks/use-is-in-view). Copyright (c) 2025 Elliot Sutton.
 * Licenza MIT + Commons Clause. Adattato in JavaScript.
 */
import { useRef } from 'react'
import { useInView } from 'motion/react'

/** { ref, isInView }: se inView e' false l'elemento si considera sempre visibile. */
export function useIsInView({ inView = false, inViewOnce = true, inViewMargin = '0px' } = {}) {
  const ref = useRef(null)
  const visibile = useInView(ref, { once: inViewOnce, margin: inViewMargin })
  return { ref, isInView: !inView || visibile }
}
