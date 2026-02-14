import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import bouquetsRouter from './routes/bouquets.js'
import { connectToDatabase } from './db.js'

dotenv.config()

const app = express()
const port = Number(process.env.PORT || 3001)
const rawOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173'
const clientOrigin = rawOrigin.split(/\s+/)[0]

app.use(cors({ origin: clientOrigin }))
app.use(express.json({ limit: '1mb' }))

app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/bouquets', bouquetsRouter)

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ message: 'Server error' })
})

connectToDatabase(process.env.MONGODB_URI)
  .then(() => {
    app.listen(port, () => {
      console.log(`Bouquet API listening on ${port}`)
    })
  })
  .catch((error) => {
    console.error('Database connection failed', error)
    process.exit(1)
  })
