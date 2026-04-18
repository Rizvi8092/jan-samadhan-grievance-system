const jwt = require("jsonwebtoken")

const verifyToken = (req, res, next) => {
  const token = req.body.token || req.headers.authorization

  if (!token) {
    return res.status(401).json({ message: "No token" })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch {
    return res.status(401).json({ message: "Invalid token" })
  }
}

const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" })
  }
  next()
}

module.exports = { verifyToken, isAdmin }