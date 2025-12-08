import express from "express"
import { authenticateToken } from "../middlewares/auth.js"
import {
  superAdminLogin,
  adminLogin,
  userLogin,
  logout,
  getCurrentUser,
  verifyCurrentSession,
  setUserCounter,
} from "../controllers/auth/index.js"
import { ticketInfoLogin } from "../controllers/auth/ticketInfoLogin.js"
import { receptionistLogin } from "../controllers/auth/receptionistLogin.js"

const router = express.Router()

// 🔐 Super Admin Login - Secure Route (different from regular admin)
// Use complex route to prevent unauthorized access
router.post("/secure-admin-access/super-login-2024", superAdminLogin)

// Admin Login (role='admin' only)
router.post("/admin/login", adminLogin)

// User Login (role='user' only)
router.post("/user/login", userLogin)

// Ticket Info Login (role='ticket_info' only)
router.post("/ticket-info/login", ticketInfoLogin)

// Receptionist Login (role='receptionist' only)
router.post("/receptionist/login", receptionistLogin)

// Logout
router.post("/logout", authenticateToken, logout)

// Get current user
router.get("/me", authenticateToken, getCurrentUser)

// Verify current session and license
router.get("/verify", authenticateToken, verifyCurrentSession)

// Set user counter (after login)
router.post("/user/set-counter", authenticateToken, setUserCounter)

export default router
