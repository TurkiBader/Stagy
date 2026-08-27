const jwt = require('jsonwebtoken')

// Verifies the JWT sent in the Authorization header (format: "Bearer <token>").
// On success, attaches the decoded payload ({ id, role }) to req.user.
// On failure, blocks the request with 401 rather than letting it through.
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'No token provided. Please log in.' })
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid or expired token. Please log in again.' })
    }
    req.user = decoded
    next()
  })
}

module.exports = { verifyToken }