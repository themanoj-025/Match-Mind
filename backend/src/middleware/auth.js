const jwt = require('jsonwebtoken')

const authenticateToken = (req, res, next) => {
  // Check Authorization header first, then fall back to accessToken cookie
  const authHeader = req.headers['authorization']
  let token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    token = req.cookies?.accessToken
  }

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.userId = decoded.userId
    next()
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired token' })
  }
}

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      req.userId = decoded.userId
    } catch (err) {
      // Ignore invalid tokens for optional auth
    }
  }
  next()
}

module.exports = { authenticateToken, optionalAuth }
