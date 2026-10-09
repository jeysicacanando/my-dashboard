import type { ReactNode } from 'react'

type WidgetCardProps = {
  title: string
  children: ReactNode
}

export default function WidgetCard({ title, children }: WidgetCardProps) {
  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </h2>
      {children}
    </section>
  )
}