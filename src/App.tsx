import WeatherWidget from './components/WeatherWidget'
import ExpensesWidget from './components/ExpensesWidget'
import TodoWidget from './components/TodoWidget'

export default function App() {
  return (
    <main className="min-h-screen bg-slate-100 p-4">
      <div className="mx-auto max-w-5xl">
        <header className="mb-4">
          <h1 className="text-2xl font-semibold text-slate-900">Good morning</h1>
          <p className="text-sm text-slate-600">Thu, Oct 8</p>
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