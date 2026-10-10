import { peso } from './shared'
import type { Todo } from './shared'

export type WeatherInfo = { place: string; temperature: number; text: string }

type BriefingInput = {
  weather: WeatherInfo | null
  spent: number // centavos
  budget: number // centavos
  todos: Todo[]
}

export function buildBriefing({ weather, spent, budget, todos }: BriefingInput): string[] {
  const lines: string[] = []

  // Weather
  if (weather) {
    let line = `${weather.temperature}°C and ${weather.text.toLowerCase()} in ${weather.place}.`
    if (/rain|drizzle|shower|thunder/i.test(weather.text)) line += ' Take an umbrella.'
    lines.push(line)
  } else {
    lines.push('Weather is still loading.')
  }

  // Money
  const pct = Math.round((spent / budget) * 100)
  let money = `${peso.format(spent / 100)} spent of ${peso.format(budget / 100)} today (${pct}%).`
  if (spent > budget) money += ' Over budget.'
  else if (pct >= 80) money += ' Close to the limit.'
  lines.push(money)

  // Tasks
  const open = todos.filter((t) => !t.done)
  if (open.length === 0) {
    lines.push(todos.length ? 'All tasks done.' : 'No tasks yet.')
  } else {
    const high = open.filter((t) => t.priority === 'high')
    let tasks = `${open.length} task${open.length === 1 ? '' : 's'} open.`
    if (high.length) tasks += ` High priority: ${high.map((t) => t.text).join(', ')}.`
    lines.push(tasks)
  }

  return lines
}