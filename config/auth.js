import jwt from "jsonwebtoken"

export const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-here"

export const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  })
}

export const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    return decoded
  } catch (error) {
    console.error('❌ JWT verification failed:', error.message)
    console.error('Token preview:', token ? token.substring(0, 30) + '...' : 'null/undefined')
    throw new Error("Invalid or expired token")
  }
}
