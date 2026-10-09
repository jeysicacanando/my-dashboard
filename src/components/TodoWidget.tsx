import { useState } from 'react'
import type { Dispatch, FormEvent, SetStateAction } from 'react'
import WidgetCard from './WidgetCard'
import type { Priority, Todo } from '../shared'

type Props = {
  todos: Todo[]
  setTodos: Dispatch<SetStateAction<Todo[]>>
}

export default function TodoWidget({ todos, setTodos }: Props) {
  const [text, setText] = useState('')
  const [priority, setPriority] = useState<Priority>('normal')

  const doneCount = todos.filter((t) => t.done).length
  const sorted = [...todos].sort(
    (a, b) => Number(b.priority === 'high') - Number(a.priority === 'high')
  )

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!text.trim()) return
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    setTodos([...todos, { id, text: text.trim(), done: false, priority }])
    setText('')
    setPriority('normal')
  }

  function toggle(id: string) {
    setTodos(todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))
  }

  function remove(id: string) {
    setTodos(todos.filter((t) => t.id !== id))
  }

  function clearDone() {
    setTodos(todos.filter((t) => !t.done))
  }

  return (
    <WidgetCard title="To-do">
      <p className="text-sm text-muted">
        {todos.length === 0 ? 'Nothing planned yet.' : `${doneCount} of ${todos.length} done`}
      </p>

      <form onSubmit={handleSubmit} className="mt-3 flex flex-wrap gap-2">
        <label className="flex-1">
          <span className="sr-only">New task</span>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Pay internet"
            className="w-full rounded-lg border border-line px-3 py-2"
          />
        </label>
        <label>
          <span className="sr-only">Priority</span>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className="min-h-11 rounded-lg border border-line px-2 py-2"
          >
            <option value="normal">Normal</option>
            <option value="high">High</option>
          </select>
        </label>
        <button
          type="submit"
          className="min-h-11 rounded-lg bg-accent px-4 font-medium text-void"
        >
          Add
        </button>
      </form>

      <ul className="mt-3 space-y-1">
        {sorted.map((t) => (
          <li key={t.id} className="flex items-center justify-between gap-2">
            <label className="flex min-h-11 flex-1 items-center gap-3">
              <input
                type="checkbox"
                checked={t.done}
                onChange={() => toggle(t.id)}
                className="h-5 w-5"
              />
              <span className={t.done ? 'text-faint line-through' : 'text-ink'}>
                {t.text}
                {t.priority === 'high' && (
                  <span className="ml-2 rounded bg-danger/20 px-1.5 py-0.5 text-xs font-medium text-danger">
                    High
                  </span>
                )}
              </span>
            </label>
            <button
              onClick={() => remove(t.id)}
              aria-label={`Delete ${t.text}`}
              className="min-h-11 min-w-11 text-faint hover:text-danger"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      {doneCount > 0 && (
        <button onClick={clearDone} className="mt-2 min-h-11 text-sm text-muted underline">
          Clear completed
        </button>
      )}
    </WidgetCard>
  )
}