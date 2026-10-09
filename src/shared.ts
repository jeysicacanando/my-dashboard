export type Expense = { id: string; label: string; centavos: number; date: string }
export type Priority = 'high' | 'normal'
export type Todo = { id: string; text: string; done: boolean; priority?: Priority }

export const DAILY_BUDGET = 50000 // centavos, so ₱500.00

export const peso = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' })
export const today = () => new Date().toLocaleDateString('en-CA') // YYYY-MM-DD, local time
export const newId = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`