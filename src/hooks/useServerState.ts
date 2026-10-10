import { useEffect, useState } from 'react'

function readLocal<T>(key: string, initial: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : initial
  } catch {
    return initial
  }
}

// Same shape as useLocalStorage: const [value, setValue] = useServerState(key, initial)
export function useServerState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => readLocal(key, initial))
  const [ready, setReady] = useState(false)

  // 1. Load from the server once
  useEffect(() => {
    let cancelled = false
    fetch(`/api/data/${key}`)
      .then((r) => {
        if (!r.ok) throw new Error('bad response')
        return r.json()
      })
      .then((body) => {
        if (cancelled) return
        // If the server has nothing yet, keep the local data (it gets uploaded below)
        if (body.value !== null) setValue(body.value as T)
        setReady(true)
      })
      .catch(() => {
        // Server is off: keep working from the local backup, and don't upload anything
      })
    return () => {
      cancelled = true
    }
  }, [key])

  // 2. Save: always keep a local backup, and send to the server once loaded
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // storage unavailable, ignore
    }
    if (!ready) return
    const timer = setTimeout(() => {
      fetch(`/api/data/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value }),
      }).catch(() => {})
    }, 300)
    return () => clearTimeout(timer)
  }, [key, value, ready])

  return [value, setValue] as const
}