/**
 * Logo Veloce Motors (dal design Stitch) come SVG in linea: "VELOCE" e il
 * sottotitolo usano i token colore, quindi si leggono anche nel tema scuro.
 */
export default function Logo({ className = 'h-9 w-auto' }) {
  return (
    <svg viewBox="0 0 240 50" fill="none" role="img" aria-label="Veloce Motors" className={className}>
      <rect width="42" height="42" y="4" rx="10" fill="#0F2E33" stroke="var(--color-outline-variant)" strokeWidth="1" />
      <path
        d="M12 28L18 16H30L34 24M12 28H15M12 28L14 32H32L34 24M15 32A3 3 0 1 0 15 26A3 3 0 0 0 15 32ZM29 32A3 3 0 1 0 29 26A3 3 0 0 0 29 32Z"
        stroke="#6FD3DE"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M22 19L27 19" stroke="#9AE3EB" strokeWidth="2" strokeLinecap="round" />
      <text x="52" y="27" fontFamily="system-ui, sans-serif" fontSize="19" fontWeight="800" fill="var(--color-on-surface)" letterSpacing="-0.5">
        VELOCE<tspan fill="var(--color-secondary)">MOTORS</tspan>
      </text>
      <text x="53" y="40" fontFamily="system-ui, sans-serif" fontSize="9.5" fontWeight="600" fill="var(--color-outline)" letterSpacing="1.5">
        PREMIUM SELECTION
      </text>
    </svg>
  )
}
