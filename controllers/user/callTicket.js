import pool from "../../config/database.js";

export const callTicket = async (req, res) => {
  const { ticketNumber } = req.body;
  const userId = req.user.id;

  if (!ticketNumber) {
    return res.status(400).json({ 
      success: false, 
      message: "Ticket number is required" 
    });
  }

  const connection = await pool.getConnection();
  try {
    // Get user's counter from session
    const [sessions] = await connection.query(
      "SELECT counter_no FROM user_sessions WHERE user_id = ? AND is_active = 1 ORDER BY created_at DESC LIMIT 1",
      [userId]
    );

    const counterNo = sessions.length > 0 ? sessions[0].counter_no : null;

    // Update ticket with caller info (always update called_at to allow re-calling)
    const [result] = await pool.query(
      `UPDATE tickets 
       SET status = 'called', 
           counter_no = ?,
           caller = ?,
           called_at = NOW()
       WHERE ticket_id = ?`,
      [counterNo, userId, ticketNumber]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found"
      });
    }

    // Verify the update
    const [verify] = await connection.query(
      `SELECT ticket_id, status, caller, counter_no FROM tickets WHERE ticket_id = ?`,
      [ticketNumber]
    );
    
    console.log(`[callTicket] User ${userId} called ticket ${ticketNumber}`);
    console.log(`[callTicket] Verification: status=${verify[0]?.status}, caller=${verify[0]?.caller}, counter=${verify[0]?.counter_no}`);
    
    res.json({
      success: true,
      message: "Ticket called successfully",
      counterNo
    });
  } catch (error) {
    console.error("[callTicket] Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to call ticket"
    });
  } finally {
    connection.release();
  }
};
