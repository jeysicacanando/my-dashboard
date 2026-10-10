import type { Priority } from './shared'

export type Command =
  | { type: 'expense'; centavos: number; label: string }
  | { type: 'todo'; text: string; priority: Priority }
  | { type: 'done'; query: string }
  | { type: 'weather'; city: string }
  | { type: 'clear-done' }
  | { type: 'help' }
  | { type: 'error'; message: string }

export type RunnableCommand = Exclude<Command, { type: 'error' }>

const MAX_TEXT = 80
const MAX_CENTAVOS = 100_000_000 // 1,000,000 pesos

export function parseCommand(input: string): Command {
  const text = input.trim().replace(/\s+/g, ' ')
  if (!text) return { type: 'error', message: 'Type a command, or "help".' }

  if (/^(help|\?)$/i.test(text)) return { type: 'help' }
  if (/^clear done$/i.test(text)) return { type: 'clear-done' }

  const amountFirst = text.match(/^(?:add )?(?:expense|spent) (\d+(?:\.\d{1,2})?) (.+)$/i)
  const labelFirst = text.match(/^(?:add )?(?:expense|spent) (.+?) (\d+(?:\.\d{1,2})?)$/i)
  const expense = amountFirst
    ? { amount: amountFirst[1], label: amountFirst[2] }
    : labelFirst
      ? { amount: labelFirst[2], label: labelFirst[1] }
      : null

  if (expense) {
    const centavos = Math.round(parseFloat(expense.amount) * 100)
    if (centavos <= 0) return { type: 'error', message: 'Amount must be more than zero.' }
    if (centavos > MAX_CENTAVOS) return { type: 'error', message: 'That amount is too large.' }
    if (expense.label.length > MAX_TEXT) return { type: 'error', message: 'Label is too long.' }
    return { type: 'expense', centavos, label: expense.label }
  }

  const todo = text.match(/^(?:add )?(?:todo|task) (high )?(.+)$/i)
  if (todo) {
    if (todo[2].length > MAX_TEXT) return { type: 'error', message: 'Task is too long.' }
    return { type: 'todo', text: todo[2], priority: todo[1] ? 'high' : 'normal' }
  }

  const done = text.match(/^done (.+)$/i)
  if (done) return { type: 'done', query: done[1] }

  const weather = text.match(/^weather (.+)$/i)
  if (weather) {
    if (weather[1].length > MAX_TEXT) return { type: 'error', message: 'City name is too long.' }
    return { type: 'weather', city: weather[1] }
  }

  return { type: 'error', message: 'Unknown command. Try: add expense 120 lunch' }
}