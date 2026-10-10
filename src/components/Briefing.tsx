import WidgetCard from './WidgetCard'
import { buildBriefing } from '../briefing'
import type { WeatherInfo } from '../briefing'
import type { Todo } from '../shared'

type Props = {
  weather: WeatherInfo | null
  spent: number
  budget: number
  todos: Todo[]
}

export default function Briefing(props: Props) {
  const lines = buildBriefing(props)

  return (
    <WidgetCard title="Briefing">
      <ul className="space-y-1 text-sm text-ink">
        {lines.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </WidgetCard>
  )
}