const mysql2 = require('mysql2')
const dotenv = require('dotenv')

dotenv.config()

// A pool (instead of a single connection) automatically reconnects and
// hands out fresh connections per query, so one dropped/idle connection
// can't take the whole backend down mid-demo.
const pool = mysql2.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

// Quick startup check — doesn't hold a connection open, just confirms the DB is reachable
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Database connection failed:', err.message)
    return
  }
  console.log('Connected to MySQL database!')
  connection.release()
})

module.exports = pool