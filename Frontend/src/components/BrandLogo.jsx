/**
 * BrandLogo — Componente reutilizable de identidad visual.
 * Muestra logoUnifit.png + el texto "UniFit" juntos.
 *
 * Props:
 *   size  — 'sm' | 'md' | 'lg'  (default: 'md')
 *   text  — mostrar texto "UniFit" (default: true)
 */
import logoUnifit from '../assets/images/logoUnifit.png'

const sizes = {
  sm: { img: 28,  fontSize: '1rem',    gap: '0.4rem',  direction: 'row' },
  md: { img: 38,  fontSize: '1.25rem', gap: '0.6rem',  direction: 'row' },
  rg: { img: 48,  fontSize: '1.5rem',  gap: '0.75rem', direction: 'row' },
  lg: { img: 180, fontSize: '2.75rem', gap: '0.75rem', direction: 'column' },
}

export default function BrandLogo({ size = 'md', text = true }) {
  const s = sizes[size] ?? sizes.md

  return (
    <span
      style={{
        display: 'inline-flex',
        flexDirection: s.direction,
        alignItems: 'center',
        gap: s.gap,
        textDecoration: 'none',
        userSelect: 'none',
      }}
    >
      <img
        src={logoUnifit}
        alt="UniFit logo"
        height={s.img}
        width={s.img}
        style={{ objectFit: 'contain', flexShrink: 0 }}
      />
      {text && (
        <span
          style={{
            fontSize: s.fontSize,
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1,
            color: '#FFFFFF',
          }}
        >
          Uni<span style={{ color: '#E10600' }}>Fit</span>
        </span>
      )}
    </span>
  )
}
