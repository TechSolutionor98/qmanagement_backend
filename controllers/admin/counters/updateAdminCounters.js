import pool from "../../../config/database.js"

export const updateAdminCounters = async (req, res) => {
  const { adminId } = req.params
  const { counters } = req.body // Array of { counter_no: number, counter_name: string }

  if (!adminId) {
    return res.status(400).json({ success: false, message: "Admin ID required" })
  }

  if (!Array.isArray(counters)) {
    return res.status(400).json({ success: false, message: "counters array is required" })
  }

  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()

    for (const c of counters) {
      if (c.counter_no) {
        const trimmedName = typeof c.counter_name === 'string' ? c.counter_name.trim() : ''
        if (trimmedName) {
          await connection.query(
            `INSERT INTO admin_counter_names (admin_id, counter_no, counter_name) 
             VALUES (?, ?, ?) 
             ON DUPLICATE KEY UPDATE counter_name = VALUES(counter_name)`,
            [adminId, c.counter_no, trimmedName]
          )
        } else {
          // If empty string, remove custom name so default 'Counter X' is used
          await connection.query(
            `DELETE FROM admin_counter_names WHERE admin_id = ? AND counter_no = ?`,
            [adminId, c.counter_no]
          )
        }
      }
    }

    await connection.commit()
    res.json({ success: true, message: "Counter names updated successfully" })
  } catch (error) {
    await connection.rollback()
    console.error("[updateAdminCounters] error", error)
    res.status(500).json({ success: false, message: "Failed to update counter names", error: error.message })
  } finally {
    connection.release()
  }
}
