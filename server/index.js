import express from 'express'

const app = express()
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() })
})

// 127.0.0.1 means only this computer can reach it, not other devices on your Wi-Fi
app.listen(3001, '127.0.0.1', () => {
  console.log('Jarvis server running at http://127.0.0.1:3001')
})