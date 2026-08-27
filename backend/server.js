const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')

dotenv.config()

const app = express()
const db = require('./config/db')

app.use(cors())
app.use(express.json())
app.use('/uploads', express.static('uploads'))

app.use('/api/auth', require('./routes/auth'))
app.use('/api/internships', require('./routes/internships'))
app.use('/api/users', require('./routes/users'))
app.use('/api/applications', require('./routes/applications'))
app.use('/api/notifications', require('./routes/notifications'))

app.get('/', (req, res) => {
  res.json({ message: 'Stagy API is running!' })
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})