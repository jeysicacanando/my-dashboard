import Header from './components/Header'
import WeatherWidget from './components/WeatherWidget'
import ExpensesWidget from './components/ExpensesWidget'
import TodoWidget from './components/TodoWidget'

export default function App() {
  return (
    <main className="hud-grid min-h-screen p-4">
      <div className="mx-auto max-w-5xl">
        <Header />

        <div className="grid gap-4 md:grid-cols-3">
          <WeatherWidget />
          <ExpensesWidget />
          <TodoWidget />
        </div>
      </div>
    </main>
  )
}