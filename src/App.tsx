import BootLine from './components/BootLine'
import Header from './components/Header'
import WeatherWidget from './components/WeatherWidget'
import ExpensesWidget from './components/ExpensesWidget'
import TodoWidget from './components/TodoWidget'

const delay = (ms: number) => ({ '--delay': `${ms}ms` }) as React.CSSProperties

export default function App() {
  return (
    <main className="hud-grid min-h-screen p-4">
      <div className="mx-auto max-w-5xl">
        <BootLine />
        <div className="boot-in" style={delay(0)}>
          <Header />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="boot-in [&>section]:h-full" style={delay(300)}>
            <WeatherWidget />
          </div>
          <div className="boot-in [&>section]:h-full" style={delay(500)}>
            <ExpensesWidget />
          </div>
          <div className="boot-in [&>section]:h-full" style={delay(700)}>
            <TodoWidget />
          </div>
        </div>
      </div>
    </main>
  )
}