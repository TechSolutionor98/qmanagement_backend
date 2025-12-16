import pool from "../../config/database.js"

export const getAllTickets = async (req, res) => {
  const { status, from_date, to_date, counter_no, representative_id, search, today, userId, adminId } = req.query
  const userRole = req.user?.role
  const currentUserId = req.user?.id
  const currentUserAdminId = req.user?.admin_id

  console.log('👤 [getAllTickets] User info:', { id: currentUserId, role: userRole, adminId: currentUserAdminId })
  console.log('🔍 [getAllTickets] Query params:', { userId, adminId, today, status })

  const connection = await pool.getConnection()
  try {
    let query = "SELECT * FROM tickets WHERE 1=1"
    const params = []

    // Filter by admin_id - very important for multi-tenant isolation
    // Priority: adminId param > userId param > current user's admin_id
    if (adminId) {
      query += " AND admin_id = ?"
      params.push(adminId)
    } else if (userId) {
      // If userId is passed, get tickets for that user's admin
      const [userRows] = await connection.query("SELECT admin_id FROM users WHERE id = ?", [userId])
      if (userRows.length > 0) {
        query += " AND admin_id = ?"
        params.push(userRows[0].admin_id)
      }
    } else if (userRole === 'admin') {
      // If user is an admin, show only their tickets
      query += " AND admin_id = ?"
      params.push(currentUserId)
    } else if (userRole === 'user' || userRole === 'receptionist') {
      // If user is a regular user/receptionist, show tickets from their admin
      query += " AND admin_id = ?"
      params.push(currentUserAdminId)
    }
    // Super admin sees all tickets if no adminId specified

    // Filter by today's date
    if (today === 'true') {
      query += " AND DATE(created_at) = CURDATE()"
    }

    if (status) {
      query += " AND status = ?"
      params.push(status)
    }

    if (counter_no) {
      query += " AND counter_no = ?"
      params.push(counter_no)
    }

    if (representative_id) {
      query += " AND representative_id = ?"
      params.push(representative_id)
    }

    if (from_date && to_date) {
      query += " AND DATE(date) BETWEEN ? AND ?"
      params.push(from_date, to_date)
    } else if (from_date) {
      query += " AND DATE(date) >= ?"
      params.push(from_date)
    }

    if (search) {
      query += " AND (ticket_id LIKE ? OR name LIKE ? OR service_name LIKE ?)"
      params.push(`%${search}%`, `%${search}%`, `%${search}%`)
    }

    query += " ORDER BY created_at DESC LIMIT 100"

    console.log('📋 [getAllTickets] Query:', query)
    console.log('📋 [getAllTickets] Params:', params)
    
    const [tickets] = await connection.query(query, params)

    console.log('📋 [getAllTickets] Found tickets:', tickets.length)
    res.json({ success: true, tickets })
  } catch (error) {
    console.error('❌ [getAllTickets] Error:', error.message)
    res.status(500).json({ success: false, error: error.message })
  } finally {
    connection.release()
  }
}
