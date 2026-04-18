const jwt = require("jsonwebtoken")

const generateToken = (user) => {
  return jwt.sign(
    {
      email: user.email,
      role: user.role || "user"
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  )
}

module.exports = { generateToken }