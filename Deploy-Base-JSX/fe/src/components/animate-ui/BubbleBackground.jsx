/*
 * Bubble Background – da Animate UI (https://animate-ui.com/docs/components/backgrounds/bubble)
 * Copyright (c) 2025 Elliot Sutton. Licenza MIT + Commons Clause: uso libero in
 * un'applicazione o sito, vietato rivendere i componenti così come sono.
 *
 * Adattato per questo progetto: JavaScript (JSX) invece di TypeScript, colori
 * passati come variabili CSS sul contenitore (non su :root), id del filtro SVG
 * unico, animazioni ferme con prefers-reduced-motion.
 */
import { useEffect, useId, useLayoutEffect, useRef } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react'

const COLORI_DEFAULT = {
  first: '18,113,255',
  second: '221,74,255',
  third: '0,220,255',
  fourth: '200,50,50',
  fifth: '180,180,50',
  sixth: '140,100,255',
}

const stileGpu = { transform: 'translateZ(0)', willChange: 'transform' }

export default function BubbleBackground({
  className = '',
  children,
  interactive = false,
  transition = { stiffness: 100, damping: 20 },
  colors = COLORI_DEFAULT,
  style,
  ...props
}) {
  const contenitore = useRef(null)
  const rettangolo = useRef(null)
  const frame = useRef(null)
  const idFiltro = `goo-${useId().replace(/:/g, '')}`
  const fermo = useReducedMotion()

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springX = useSpring(mouseX, transition)
  const springY = useSpring(mouseY, transition)

  useLayoutEffect(() => {
    const aggiorna = () => {
      if (contenitore.current) rettangolo.current = contenitore.current.getBoundingClientRect()
    }
    aggiorna()
    const el = contenitore.current
    const ro = new ResizeObserver(aggiorna)
    if (el) ro.observe(el)
    window.addEventListener('resize', aggiorna)
    window.addEventListener('scroll', aggiorna, { passive: true })
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', aggiorna)
      window.removeEventListener('scroll', aggiorna)
    }
  }, [])

  useEffect(() => {
    if (!interactive || fermo) return
    const el = contenitore.current
    if (!el) return
    const muovi = (e) => {
      const r = rettangolo.current
      if (!r) return
      if (frame.current != null) cancelAnimationFrame(frame.current)
      frame.current = requestAnimationFrame(() => {
        mouseX.set(e.clientX - (r.left + r.width / 2))
        mouseY.set(e.clientY - (r.top + r.height / 2))
      })
    }
    el.addEventListener('mousemove', muovi, { passive: true })
    return () => {
      el.removeEventListener('mousemove', muovi)
      if (frame.current != null) cancelAnimationFrame(frame.current)
    }
  }, [interactive, fermo, mouseX, mouseY])

  // Con prefers-reduced-motion le bolle restano dove sono: niente animate.
  const anima = (valori, durata, ease = 'easeInOut') =>
    fermo ? {} : { animate: valori, transition: { duration: durata, ease, repeat: Infinity } }

  const variabili = {
    '--first-color': colors.first,
    '--second-color': colors.second,
    '--third-color': colors.third,
    '--fourth-color': colors.fourth,
    '--fifth-color': colors.fifth,
    '--sixth-color': colors.sixth,
  }

  return (
    <div
      ref={contenitore}
      data-slot="bubble-background"
      className={`relative overflow-hidden ${className}`}
      style={{ ...variabili, ...style }}
      {...props}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="absolute top-0 left-0 h-0 w-0" aria-hidden="true">
        <defs>
          <filter id={idFiltro}>
            <feGaussianBlur in="SourceGraphic" stdDeviation="16" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8" result="goo" />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      <div className="pointer-events-none absolute inset-0" style={{ filter: `url(#${idFiltro}) blur(40px)` }} aria-hidden="true">
        <motion.div
          className="absolute top-[10%] left-[10%] size-[80%] rounded-full bg-[radial-gradient(circle_at_center,rgba(var(--first-color),0.8)_0%,rgba(var(--first-color),0)_50%)] mix-blend-hard-light"
          {...anima({ y: [-50, 50, -50] }, 30)}
          style={stileGpu}
        />
        <motion.div
          className="absolute inset-0 flex origin-[calc(50%-400px)] items-center justify-center"
          {...anima({ rotate: 360 }, 20, 'linear')}
          style={stileGpu}
        >
          <div className="size-[80%] rounded-full bg-[radial-gradient(circle_at_center,rgba(var(--second-color),0.8)_0%,rgba(var(--second-color),0)_50%)] mix-blend-hard-light" />
        </motion.div>
        <motion.div
          className="absolute inset-0 flex origin-[calc(50%+400px)] items-center justify-center"
          {...anima({ rotate: 360 }, 40, 'linear')}
          style={stileGpu}
        >
          <div className="absolute top-[calc(50%+200px)] left-[calc(50%-500px)] size-[80%] rounded-full bg-[radial-gradient(circle_at_center,rgba(var(--third-color),0.8)_0%,rgba(var(--third-color),0)_50%)] mix-blend-hard-light" />
        </motion.div>
        <motion.div
          className="absolute top-[10%] left-[10%] size-[80%] rounded-full bg-[radial-gradient(circle_at_center,rgba(var(--fourth-color),0.8)_0%,rgba(var(--fourth-color),0)_50%)] opacity-70 mix-blend-hard-light"
          {...anima({ x: [-50, 50, -50] }, 40)}
          style={stileGpu}
        />
        <motion.div
          className="absolute inset-0 flex origin-[calc(50%_-_800px)_calc(50%_+_200px)] items-center justify-center"
          {...anima({ rotate: 360 }, 20, 'linear')}
          style={stileGpu}
        >
          <div className="absolute top-[calc(50%-80%)] left-[calc(50%-80%)] size-[160%] rounded-full bg-[radial-gradient(circle_at_center,rgba(var(--fifth-color),0.8)_0%,rgba(var(--fifth-color),0)_50%)] mix-blend-hard-light" />
        </motion.div>
        {interactive && !fermo && (
          <motion.div
            className="absolute size-full rounded-full bg-[radial-gradient(circle_at_center,rgba(var(--sixth-color),0.8)_0%,rgba(var(--sixth-color),0)_50%)] opacity-70 mix-blend-hard-light"
            style={{ x: springX, y: springY, ...stileGpu }}
          />
        )}
      </div>

      {children}
    </div>
  )
}
