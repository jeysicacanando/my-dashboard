import { useState } from 'react'
import type { FormEvent } from 'react'
import WidgetCard from './WidgetCard'
import { useLocalStorage } from '../hooks/useLocalStorage'

type Expense = { id: string; label: string; centavos: number; date: string }

const peso = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' })
const today = () => new Date().toLocaleDateString('en-CA') // YYYY-MM-DD, local time

export default function ExpensesWidget() {
  const [expenses, setExpenses] = useLocalStorage<Expense[]>('expenses', [])
  const [label, setLabel] = useState('')
  const [amount, setAmount] = useState('')

  const todays = expenses.filter((e) => e.date === today())
  const total = todays.reduce((sum, e) => sum + e.centavos, 0)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const centavos = Math.round(parseFloat(amount) * 100)
    if (!label.trim() || !Number.isFinite(centavos) || centavos <= 0) return
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    setExpenses([...expenses, { id, label: label.trim(), centavos, date: today() }])
    setLabel('')
    setAmount('')
  }

  function remove(id: string) {
    setExpenses(expenses.filter((e) => e.id !== id))
  }

  return (
    <WidgetCard title="Spent today">
      <p className="text-3xl font-semibold text-slate-900">{peso.format(total / 100)}</p>

      <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
        <label className="flex-1">
          <span className="sr-only">What for</span>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Lunch"
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="w-24">
          <span className="sr-only">Amount in pesos</span>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="120"
            inputMode="decimal"
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>
        <button
          type="submit"
          className="min-h-11 rounded-lg bg-slate-900 px-4 font-medium text-white"
        >
          Add
        </button>
      </form>

      {todays.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">No expenses yet today.</p>
      ) : (
        <ul className="mt-3 space-y-1 text-slate-700">
          {todays.map((e) => (
            <li key={e.id} className="flex items-center justify-between gap-2">
              <span>{e.label}</span>
              <span className="flex items-center gap-2">
                {peso.format(e.centavos / 100)}
                <button
                  onClick={() => remove(e.id)}
                  aria-label={`Delete ${e.label}`}
                  className="min-h-11 min-w-11 text-slate-400 hover:text-red-600"
                >
                  ✕
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </WidgetCard>
  )
}