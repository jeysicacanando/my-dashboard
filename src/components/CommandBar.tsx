import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { parseCommand } from '../commands'
import type { RunnableCommand } from '../commands'

type Props = {
  onCommand: (cmd: RunnableCommand) => string
}

export default function CommandBar({ onCommand }: Props) {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState<{ text: string; ok: boolean } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const wasOpen = useRef(false)

  // Global shortcuts: Ctrl/Cmd+K toggles, "/" opens, Esc closes.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
        return
      }
      if (e.key === 'Escape') {
        setOpen(false)
        return
      }
      const target = e.target as HTMLElement
      const typing = target.closest('input, textarea, select, [contenteditable="true"]')
      if (e.key === '/' && !typing && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault()
        setOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Move focus into the input on open, and back to the button on close.
  useEffect(() => {
    if (open) {
      wasOpen.current = true
      inputRef.current?.focus()
    } else if (wasOpen.current) {
      triggerRef.current?.focus()
    }
  }, [open])

  function submit(event: FormEvent) {
    event.preventDefault()
    const cmd = parseCommand(input)
    if (cmd.type === 'error') {
      setFeedback({ text: cmd.message, ok: false })
      return
    }
    setFeedback({ text: onCommand(cmd), ok: true })
    setInput('')
  }

  return (
    <>
      <button
        ref={triggerRef}
        onClick={() => setOpen(true)}
        className="min-h-11 rounded-lg border border-line px-3 text-sm text-muted hover:text-ink"
      >
        Command
        <kbd className="ml-2 hidden rounded border border-line px-1.5 text-xs text-faint sm:inline">
          Ctrl K
        </kbd>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-void/80 p-4 pt-[15vh] backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Command bar"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl rounded-sm border border-accent bg-panel p-4 shadow-glow"
          >
            <form onSubmit={submit}>
              <label className="block">
                <span className="mb-2 block font-display text-xs uppercase tracking-widest text-accent">
                  Command
                </span>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value)
                    setFeedback(null)
                  }}
                  placeholder="add expense 120 lunch"
                  autoComplete="off"
                  spellCheck={false}
                  className="w-full rounded-lg border border-line px-3 py-3 text-lg"
                />
              </label>
            </form>

            <p
              role="status"
              className={`mt-3 min-h-6 text-sm ${feedback?.ok === false ? 'text-danger' : 'text-muted'}`}
            >
              {feedback?.text}
            </p>
            <p className="mt-1 text-xs text-faint">Type help for commands · Esc to close</p>
          </div>
        </div>
      )}
    </>
  )
}