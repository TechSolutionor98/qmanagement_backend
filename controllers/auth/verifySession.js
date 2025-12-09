import { verifyToken } from "../../config/auth.js"
import { validateAdminSession, validateUserSession } from "./sessionManager.js"

export const verifyCurrentSession = async (req, res) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: "No token provided",
      session_expired: true
    })
  }

  try {
    // Verify JWT
    const decoded = verifyToken(token)
    console.log('🔍 Verify session - decoded role:', decoded.role, 'user id:', decoded.id)
    
    // Validate session in database
    let sessionValidation
    if (decoded.role === 'user' || decoded.role === 'ticket_info' || decoded.role === 'receptionist') {
      console.log('  ✅ Validating user session for role:', decoded.role)
      sessionValidation = await validateUserSession(token)
    } else if (decoded.role === 'admin' || decoded.role === 'super_admin') {
      console.log('  ✅ Validating admin session')
      sessionValidation = await validateAdminSession(token)
    }

    if (!sessionValidation || !sessionValidation.valid) {
      console.log('  ❌ Session validation failed:', sessionValidation?.message)
      return res.status(403).json({ 
        success: false, 
        message: sessionValidation?.message || "Session expired or invalid",
        session_expired: true
      })
    }
    
    console.log('  ✅ Session validated successfully for user:', sessionValidation.user.username)

    // Check license for admins
    if (decoded.role === 'admin') {
      const { verifyAdminLicense } = await import('../../utils/licenseUtils.js')
      const licenseCheck = await verifyAdminLicense(sessionValidation.user.id)
      
      if (!licenseCheck.valid) {
        return res.status(403).json({
          success: false,
          message: licenseCheck.message,
          license_expired: true,
          license_info: licenseCheck.license
        })
      }

      return res.status(200).json({
        success: true,
        user: sessionValidation.user,
        license_valid: true,
        days_remaining: licenseCheck.daysRemaining,
        message: "Session and license are valid"
      })
    }

    res.status(200).json({
      success: true,
      user: sessionValidation.user,
      message: "Session is valid"
    })
  } catch (error) {
    console.error("Verify session error:", error)
    res.status(403).json({ 
      success: false, 
      message: "Invalid token",
      session_expired: true
    })
  }
}
