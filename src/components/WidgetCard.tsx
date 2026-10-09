import type { ReactNode } from 'react'

type WidgetCardProps = {
  title: string
  children: ReactNode
}

const corner = 'pointer-events-none absolute h-3 w-3 border-accent'

export default function WidgetCard({ title, children }: WidgetCardProps) {
  return (
    <section className="relative rounded-sm border border-line bg-panel/70 p-4 shadow-glow backdrop-blur-sm">
      <span aria-hidden className={`${corner} -left-px -top-px border-l-2 border-t-2`} />
      <span aria-hidden className={`${corner} -right-px -top-px border-r-2 border-t-2`} />
      <span aria-hidden className={`${corner} -bottom-px -left-px border-b-2 border-l-2`} />
      <span aria-hidden className={`${corner} -bottom-px -right-px border-b-2 border-r-2`} />

      <h2 className="mb-3 font-display text-xs uppercase tracking-widest text-accent">
        {title}
      </h2>
      {children}
    </section>
  )
}