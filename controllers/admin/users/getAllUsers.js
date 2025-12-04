import pool from "../../../config/database.js"

export const getAllUsers = async (req, res) => {
  const connection = await pool.getConnection()
  try {
    const { adminId } = req.query

    let query = `
      SELECT 
        u.id, 
        u.username, 
        u.email, 
        u.status, 
        u.admin_id, 
        u.role,
        CASE WHEN us.session_id IS NOT NULL THEN 1 ELSE 0 END as isLoggedIn,
        us.last_activity as lastActivity
      FROM users u
      LEFT JOIN user_sessions us ON u.id = us.user_id
    `
    const params = []

    if (adminId) {
      query += " WHERE u.admin_id = ?"
      params.push(adminId)
    } else if (req.user?.role === "admin") {
      query += " WHERE u.admin_id = ?"
      params.push(req.user.id)
    }

    const [users] = await connection.query(query, params)

    res.json({ success: true, users })
  } catch (error) {
    console.error("Get all users error:", error)
    res.status(500).json({ success: false, message: "Failed to retrieve users" })
  } finally {
    connection.release()
  }
}
