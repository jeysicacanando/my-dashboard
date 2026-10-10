import { useState } from 'react'
import type { CSSProperties } from 'react'
import BootLine from './components/BootLine'
import Header from './components/Header'
import Gauge from './components/Gauge'
import WidgetCard from './components/WidgetCard'
import WeatherWidget from './components/WeatherWidget'
import ExpensesWidget from './components/ExpensesWidget'
import TodoWidget from './components/TodoWidget'
import { useLocalStorage } from './hooks/useLocalStorage'
import CommandBar from './components/CommandBar'
import { DAILY_BUDGET, newId, peso, today } from './shared'
import type { Expense, Todo } from './shared'
import type { RunnableCommand } from './commands'

const delay = (ms: number) => ({ '--delay': `${ms}ms` }) as CSSProperties
const HELP =
  'add expense 120 lunch · todo high pay internet · done internet · clear done · weather tokyo'

export default function App() {
  const [expenses, setExpenses] = useLocalStorage<Expense[]>('expenses', [])
  const [todos, setTodos] = useLocalStorage<Todo[]>('todos', [])
  const [weatherRequest, setWeatherRequest] = useState<{ city: string; id: number } | null>(null)

  const spent = expenses
    .filter((e) => e.date === today())
    .reduce((sum, e) => sum + e.centavos, 0)
  const budgetUsed = spent / DAILY_BUDGET

  const done = todos.filter((t) => t.done).length
  const missionsDone = todos.length ? done / todos.length : 0

  function handleCommand(cmd: RunnableCommand): string {
    switch (cmd.type) {
      case 'expense':
        setExpenses((prev) => [
          ...prev,
          { id: newId(), label: cmd.label, centavos: cmd.centavos, date: today() },
        ])
        return `Logged ${peso.format(cmd.centavos / 100)} for ${cmd.label}`

      case 'todo':
        setTodos((prev) => [
          ...prev,
          { id: newId(), text: cmd.text, done: false, priority: cmd.priority },
        ])
        return `Added task: ${cmd.text}`

      case 'done': {
        const q = cmd.query.toLowerCase()
        const match = todos.find((t) => !t.done && t.text.toLowerCase().includes(q))
        if (!match) return `No open task matches "${cmd.query}"`
        setTodos((prev) => prev.map((t) => (t.id === match.id ? { ...t, done: true } : t)))
        return `Completed: ${match.text}`
      }

      case 'clear-done': {
        const count = todos.filter((t) => t.done).length
        if (count === 0) return 'No completed tasks to clear'
        setTodos((prev) => prev.filter((t) => !t.done))
        return `Cleared ${count} completed task${count === 1 ? '' : 's'}`
      }

      case 'weather':
        setWeatherRequest({ city: cmd.city, id: Date.now() })
        return `Looking up weather for ${cmd.city}...`

      case 'help':
        return HELP
    }
  }

  return (
    <main className="hud-grid min-h-screen p-4">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-start justify-between gap-2">
          <BootLine />
          <CommandBar onCommand={handleCommand} />
        </div>
        <div className="boot-in" style={delay(0)}>
          <Header />
        </div>

        <div className="boot-in mb-4" style={delay(150)}>
          <WidgetCard title="Systems">
            <div className="flex flex-wrap justify-around gap-6">
              <Gauge
                label="Budget used"
                fraction={budgetUsed}
                centerText={`${Math.round(budgetUsed * 100)}%`}
                detail={`${peso.format(spent / 100)} of ${peso.format(DAILY_BUDGET / 100)}`}
                tone={budgetUsed >= 1 ? 'danger' : budgetUsed >= 0.8 ? 'warn' : 'ok'}
              />
              <Gauge
                label="Missions done"
                fraction={missionsDone}
                centerText={todos.length ? `${Math.round(missionsDone * 100)}%` : '—'}
                detail={todos.length ? `${done} of ${todos.length} tasks` : 'No tasks yet'}
              />
            </div>
          </WidgetCard>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="boot-in [&>section]:h-full" style={delay(300)}>
            <WeatherWidget request={weatherRequest} />
          </div>
          <div className="boot-in [&>section]:h-full" style={delay(500)}>
            <ExpensesWidget expenses={expenses} setExpenses={setExpenses} />
          </div>
          <div className="boot-in [&>section]:h-full" style={delay(700)}>
            <TodoWidget todos={todos} setTodos={setTodos} />
          </div>
        </div>
      </div>
    </main>
  )
}