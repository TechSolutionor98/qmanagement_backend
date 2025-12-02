import pool from "../../config/database.js"

export const lockTicket = async (req, res) => {
  const { ticketId } = req.params
  const { user_id, lock } = req.body

  const connection = await pool.getConnection()
  try {
    // Start transaction for atomic operation
    await connection.beginTransaction()

    // If locking, check if ticket is already locked with row lock
    if (lock) {
      const [existing] = await connection.query(
        "SELECT locked_by FROM tickets WHERE ticket_id = ? FOR UPDATE",
        [ticketId]
      )

      if (existing.length === 0) {
        await connection.rollback()
        return res.status(404).json({ success: false, message: "Ticket not found" })
      }

      if (existing[0].locked_by && existing[0].locked_by !== 0 && existing[0].locked_by !== user_id) {
        await connection.rollback()
        return res.status(409).json({ success: false, message: "Ticket is already locked by another user" })
      }
    }

    // Lock or unlock the ticket
    const [result] = await connection.query(
      "UPDATE tickets SET locked_by = ? WHERE ticket_id = ?",
      [lock ? user_id : null, ticketId]
    )

    console.log(`[lockTicket] ${lock ? 'Locked' : 'Unlocked'} ticket ${ticketId} by user ${user_id}, affected rows: ${result.affectedRows}`)

    // Commit transaction
    await connection.commit()

    res.json({ success: true, message: lock ? "Ticket locked" : "Ticket unlocked" })
  } catch (error) {
    await connection.rollback()
    console.error("[lockTicket] error", error)
    res.status(500).json({ success: false, message: "Internal server error" })
  } finally {
    connection.release()
  }
}
