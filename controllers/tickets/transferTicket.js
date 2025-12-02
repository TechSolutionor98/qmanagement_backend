import pool from "../../config/database.js"

export const transferTicket = async (req, res) => {
  const { ticketId } = req.params
  const { transferred_to, reason, transfer_by } = req.body

  if (!transferred_to) {
    return res.status(400).json({ success: false, message: "Transfer recipient required" })
  }

  const connection = await pool.getConnection()
  try {
    console.log(`[transferTicket] BEFORE UPDATE: ticket=${ticketId}, transferred_to=${transferred_to}, transfer_by=${transfer_by}`)
    
    // Reset ticket status and clear caller/locked_by so it becomes available for the new user
    const [result] = await connection.query(
      `UPDATE tickets 
       SET transfered = ?, 
           transfered_time = NOW(), 
           reason = ?, 
           transfer_by = ?,
           status = 'Pending',
           caller = NULL,
           locked_by = NULL,
           counter_no = NULL
       WHERE ticket_id = ?`,
      [transferred_to, reason || null, transfer_by || null, ticketId]
    )

    console.log(`[transferTicket] AFTER UPDATE: Rows affected=${result.affectedRows}`)
    
    // Verify the update
    const [verify] = await connection.query(
      `SELECT ticket_id, transfered, transfer_by, status, caller FROM tickets WHERE ticket_id = ?`,
      [ticketId]
    )
    
    if (verify.length > 0) {
      console.log(`[transferTicket] VERIFICATION: ticket=${verify[0].ticket_id}, transfered=${verify[0].transfered}, transfer_by=${verify[0].transfer_by}, status=${verify[0].status}, caller=${verify[0].caller}`)
    }
    
    res.json({ success: true, message: "Ticket transferred" })
  } finally {
    connection.release()
  }
}
