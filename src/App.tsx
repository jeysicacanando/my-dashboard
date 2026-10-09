import WeatherWidget from './components/WeatherWidget'
import ExpensesWidget from './components/ExpensesWidget'
import TodoWidget from './components/TodoWidget'

export default function App() {
  return (
    <main className="hud-grid min-h-screen p-4">
      <div className="mx-auto max-w-5xl">
        <header className="mb-4">
          <h1 className="font-display text-2xl tracking-wide text-ink">Good morning</h1>
          <p className="text-sm text-muted">Thu, Oct 8</p>
        </header>

        <div className="grid gap-4 md:grid-cols-3">
          <WeatherWidget />
          <ExpensesWidget />
          <TodoWidget />
        </div>
      </div>
    </main>
  )
}