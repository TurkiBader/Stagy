const db = require('../config/db')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

// Register
const register = (req, res) => {
  const { full_name, email, password, role } = req.body

  // Check if user already exists
  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' })

    if (results.length > 0) {
      return res.status(400).json({ message: 'Email already exists' })
    }

    // Encrypt the password
    const hashedPassword = bcrypt.hashSync(password, 10)

    // Save user to database
    db.query(
      'INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)',
      [full_name, email, hashedPassword, role],
      (err, result) => {
        if (err) return res.status(500).json({ message: 'Error creating user' })

        const userId = result.insertId

        // If student, create student profile
        if (role === 'student') {
          db.query(
            'INSERT INTO student_profiles (user_id) VALUES (?)',
            [userId],
            (err) => {
              if (err) return res.status(500).json({ message: 'Error creating student profile' })
            }
          )
        }

        // If company, create company profile
        if (role === 'company') {
          db.query(
            'INSERT INTO companies (user_id, company_name) VALUES (?, ?)',
            [userId, full_name],
            (err) => {
              if (err) return res.status(500).json({ message: 'Error creating company profile' })
            }
          )
        }

        res.status(201).json({ message: 'Account created successfully!' })
      }
    )
  })
}

// Login
const login = (req, res) => {
  const { email, password } = req.body

  // Find user by email
  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' })

    if (results.length === 0) {
      return res.status(400).json({ message: 'Email not found' })
    }

    const user = results[0]

    // Check password
    const isMatch = bcrypt.compareSync(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect password' })
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role
      }
    })
  })
}

module.exports = { register, login }