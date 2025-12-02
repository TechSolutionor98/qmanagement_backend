import pool from "../../config/database.js"

export const updateTicketStatus = async (req, res) => {
  const { ticketId } = req.params
  const { status, reason, caller, name, email, number } = req.body

  const connection = await pool.getConnection()
  try {
    // Build dynamic update query
    let updateFields = []
    const params = []

    if (status) {
      updateFields.push("status = ?")
      params.push(status)
      updateFields.push("status_time = NOW()")
    }

    if (reason) {
      updateFields.push("reason = ?")
      params.push(reason)
    }

    if (caller) {
      updateFields.push("caller = ?")
      params.push(caller)
      updateFields.push("calling_user_time = NOW()")
    }

    if (name !== undefined) {
      updateFields.push("name = ?")
      params.push(name)
    }

    if (email !== undefined) {
      updateFields.push("email = ?")
      params.push(email)
    }

    if (number !== undefined) {
      updateFields.push("number = ?")
      params.push(number)
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ success: false, message: "No fields to update" })
    }

    const updateQuery = `UPDATE tickets SET ${updateFields.join(", ")} WHERE ticket_id = ?`
    params.push(ticketId)

    const [result] = await connection.query(updateQuery, params)

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Ticket not found" })
    }

    res.json({ success: true, message: "Ticket updated" })
  } finally {
    connection.release()
  }
}
