import { useEffect, useState } from 'react'

const BOOT = 'INITIALIZING SYSTEMS...'
const ONLINE = 'ALL SYSTEMS ONLINE'

export default function BootLine() {
  const [text, setText] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setText(ONLINE)
      setDone(true)
      return
    }

    let i = 0
    let timeout: number | undefined
    const typing = setInterval(() => {
      i += 1
      setText(BOOT.slice(0, i))
      if (i >= BOOT.length) {
        clearInterval(typing)
        timeout = window.setTimeout(() => {
          setText(ONLINE)
          setDone(true)
        }, 500)
      }
    }, 35)

    return () => {
      clearInterval(typing)
      clearTimeout(timeout)
    }
  }, [])

  return (
    <p aria-hidden className="mb-2 min-h-4 font-display text-xs tracking-widest text-accent/80">
      {text}
      {!done && <span className="cursor">▌</span>}
    </p>
  )
}