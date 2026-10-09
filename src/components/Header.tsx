import { useEffect, useState } from 'react'

function greeting(hour: number): string {
  if (hour < 5) return 'Working late'
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export default function Header() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const time = now.toLocaleTimeString('en-PH', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
  const date = now.toLocaleDateString('en-PH', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <header className="mb-4 flex flex-wrap items-end justify-between gap-2">
      <div>
        <h1 className="font-display text-2xl tracking-wide text-ink">{greeting(now.getHours())}</h1>
        <p className="text-sm text-muted">{date}</p>
      </div>
      <p className="font-display text-3xl tabular-nums text-accent">{time}</p>
    </header>
  )
}