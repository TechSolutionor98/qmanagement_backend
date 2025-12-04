import pool from "../../../config/database.js"

export const logoutUser = async (req, res) => {
  const connection = await pool.getConnection()
  try {
    const { userId } = req.params

    // Delete user's session from user_sessions table
    const [result] = await connection.query(
      "DELETE FROM user_sessions WHERE user_id = ?",
      [userId]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "No active session found for this user" 
      })
    }

    console.log(`[Admin][LOGOUT] User ${userId} logged out successfully`)
    res.json({ 
      success: true, 
      message: "User logged out successfully" 
    })
  } catch (error) {
    console.error("Logout user error:", error)
    res.status(500).json({ 
      success: false, 
      message: "Failed to logout user" 
    })
  } finally {
    connection.release()
  }
}
