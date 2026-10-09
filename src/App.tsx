import type { CSSProperties } from 'react'
import BootLine from './components/BootLine'
import Header from './components/Header'
import Gauge from './components/Gauge'
import WidgetCard from './components/WidgetCard'
import WeatherWidget from './components/WeatherWidget'
import ExpensesWidget from './components/ExpensesWidget'
import TodoWidget from './components/TodoWidget'
import { useLocalStorage } from './hooks/useLocalStorage'
import { DAILY_BUDGET, peso, today } from './shared'
import type { Expense, Todo } from './shared'

const delay = (ms: number) => ({ '--delay': `${ms}ms` }) as CSSProperties

export default function App() {
  const [expenses, setExpenses] = useLocalStorage<Expense[]>('expenses', [])
  const [todos, setTodos] = useLocalStorage<Todo[]>('todos', [])

  const spent = expenses
    .filter((e) => e.date === today())
    .reduce((sum, e) => sum + e.centavos, 0)
  const budgetUsed = spent / DAILY_BUDGET

  const done = todos.filter((t) => t.done).length
  const missionsDone = todos.length ? done / todos.length : 0

  return (
    <main className="hud-grid min-h-screen p-4">
      <div className="mx-auto max-w-5xl">
        <BootLine />
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
            <WeatherWidget />
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