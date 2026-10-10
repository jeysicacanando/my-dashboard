import { useState } from 'react'
import type { FormEvent } from 'react'
import { peso } from '../shared'

type Props = {
  pesos: number
  onSave: (pesos: number) => void
}

export default function BudgetEditor({ pesos, onSave }: Props) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(String(pesos))
  const [error, setError] = useState('')

  function submit(e: FormEvent) {
    e.preventDefault()
    const n = Number(value)
    if (!Number.isFinite(n) || n <= 0) {
      setError('Enter an amount above zero.')
      return
    }
    if (n > 1_000_000) {
      setError('That amount is too large.')
      return
    }
    onSave(Math.round(n * 100) / 100)
    setError('')
    setEditing(false)
  }

  if (!editing) {
    return (
      <div className="mt-4 flex items-center justify-center gap-3 text-sm text-muted">
        <span>Daily budget {peso.format(pesos)}</span>
        <button
          onClick={() => {
            setValue(String(pesos))
            setEditing(true)
          }}
          className="rounded-sm border border-line px-2 py-1 text-xs uppercase tracking-widest hover:text-ink"
        >
          Edit
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="mt-4 flex flex-wrap items-center justify-center gap-2">
      <label className="text-sm text-muted" htmlFor="budget-input">
        Daily budget ₱
      </label>
      <input
        id="budget-input"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        inputMode="decimal"
        autoFocus
        className="w-28 rounded-lg border border-line px-3 py-1.5 text-sm"
      />
      <button
        type="submit"
        className="rounded-sm border border-accent px-3 py-1.5 text-xs uppercase tracking-widest text-accent hover:bg-accent/10"
      >
        Save
      </button>
      <button
        type="button"
        onClick={() => {
          setEditing(false)
          setError('')
        }}
        className="rounded-sm border border-line px-3 py-1.5 text-xs uppercase tracking-widest text-muted hover:text-ink"
      >
        Cancel
      </button>
      {error && <p className="w-full text-center text-xs text-danger">{error}</p>}
    </form>
  )
}