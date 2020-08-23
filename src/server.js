const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const bodyParser = require('body-parser')

const app = express()
require('dotenv/config')

// MongoDB
const connectDB = require('./config/db')
connectDB()

// Middleware
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))
app.use(cors())
app.use(bodyParser.json())

// Routes
const user = require('./routes/auth.route')

app.use('/api/user', user)

app.get('/', (req, res) => {
  res.send('test route')
})

app.use((req, res) => {
  res.status(404).json({
    msg: "Page not found"
  })
})

const PORT = process.env.LISTEN_PORT
app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`)
})