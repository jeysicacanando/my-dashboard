import express from 'express'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.join(__dirname, 'data')
const DATA_FILE = path.join(DATA_DIR, 'db.json')

// Only these names can be stored. Anything else is rejected.
const ALLOWED_KEYS = new Set(['expenses', 'todos', 'settings'])

fs.mkdirSync(DATA_DIR, { recursive: true })

let db = {}
try {
  db = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'))
} catch {
  db = {} // first run, or file not readable yet
}

// Write to a temp file, then rename, so a crash can't leave a half-written file
function save() {
  const tmp = DATA_FILE + '.tmp'
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2))
  fs.renameSync(tmp, DATA_FILE)
}

const app = express()
app.use(express.json({ limit: '1mb' }))

app.get('/api/health', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() })
})

app.get('/api/data/:key', (req, res) => {
  const { key } = req.params
  if (!ALLOWED_KEYS.has(key)) return res.status(404).json({ error: 'Unknown key' })
  res.json({ value: db[key] ?? null })
})

app.put('/api/data/:key', (req, res) => {
  const { key } = req.params
  if (!ALLOWED_KEYS.has(key)) return res.status(404).json({ error: 'Unknown key' })
  const { value } = req.body ?? {}

  // Settings are an object. Expenses and todos are lists.
  const isList = Array.isArray(value)
  const isObject = value !== null && typeof value === 'object' && !isList
  if (key === 'settings' ? !isObject : !isList) {
    return res.status(400).json({ error: 'Invalid value' })
  }

  db[key] = value
  save()
  res.json({ ok: true })
})

// 127.0.0.1 means only this computer can reach it
app.listen(3001, '127.0.0.1', () => {
  console.log('Jarvis server running at http://127.0.0.1:3001')
})