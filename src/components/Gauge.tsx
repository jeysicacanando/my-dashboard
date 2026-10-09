type Tone = 'ok' | 'warn' | 'danger'

type GaugeProps = {
  label: string
  fraction: number // 0 to 1
  centerText: string
  detail: string
  tone?: Tone
}

const R = 48
const CIRC = 2 * Math.PI * R // length of the circle's outline

const strokeClass: Record<Tone, string> = {
  ok: 'stroke-accent',
  warn: 'stroke-warn',
  danger: 'stroke-danger',
}

export default function Gauge({ label, fraction, centerText, detail, tone = 'ok' }: GaugeProps) {
  const f = Number.isFinite(fraction) ? Math.min(Math.max(fraction, 0), 1) : 0

  return (
    <figure className="flex flex-col items-center">
      <svg
        viewBox="0 0 120 120"
        role="img"
        aria-label={`${label}: ${centerText}. ${detail}`}
        className="h-36 w-36"
      >
        {/* decorative slow-spinning outer ring */}
        <circle
          cx="60" cy="60" r="57"
          fill="none" strokeWidth="1" strokeDasharray="2 6"
          className="spin-slow stroke-accent/40"
        />
        {/* background track */}
        <circle cx="60" cy="60" r={R} fill="none" strokeWidth="8" className="stroke-line" />
        {/* progress arc, starting at 12 o'clock */}
        <circle
          cx="60" cy="60" r={R}
          fill="none" strokeWidth="8" strokeLinecap="round"
          strokeDasharray={CIRC}
          strokeDashoffset={CIRC * (1 - f)}
          transform="rotate(-90 60 60)"
          className={`${strokeClass[tone]} transition-[stroke-dashoffset] duration-700`}
        />
        <text x="60" y="66" textAnchor="middle" fontSize="20" className="fill-ink font-display">
          {centerText}
        </text>
      </svg>
      <figcaption className="mt-1 text-center">
        <p className="font-display text-xs uppercase tracking-widest text-accent">{label}</p>
        <p className="text-sm text-muted">{detail}</p>
      </figcaption>
    </figure>
  )
}