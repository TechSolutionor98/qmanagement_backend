import pool from "../../config/database.js"

export const updateTicketStatus = async (req, res) => {
  const { ticketId } = req.params
  const { status, reason, caller, name, email, number, serviceTimeSeconds } = req.body
  const userId = req.user?.id;

  const connection = await pool.getConnection()
  try {
    // Get username and check if representative needs to be set
    let username = null;
    let needsRepresentative = false;
    let serviceTime = null;
    
    // Set representative for status changes (Unattended, Solved, Not Solved)
    if (status && userId && ['Unattended', 'Solved', 'Not Solved'].includes(status)) {
      const [users] = await connection.query(
        "SELECT username FROM users WHERE id = ?",
        [userId]
      );
      username = users.length > 0 ? users[0].username : null;
      needsRepresentative = true;
      
      // Calculate service time if provided (in seconds)
      if (serviceTimeSeconds && (status === 'Solved' || status === 'Not Solved')) {
        const hours = Math.floor(serviceTimeSeconds / 3600);
        const minutes = Math.floor((serviceTimeSeconds % 3600) / 60);
        const seconds = serviceTimeSeconds % 60;
        serviceTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      }
      
      console.log('🎯 [updateTicketStatus] Updating ticket with:', {
        status,
        representative: username,
        representative_id: userId,
        service_time: serviceTime,
        ticket_id: ticketId
      });
    }

    // Build dynamic update query
    let updateFields = []
    const params = []

    if (status) {
      updateFields.push("status = ?")
      params.push(status)
      updateFields.push("status_time = NOW()")
      
      // Add representative info for status changes
      if (needsRepresentative && username) {
        updateFields.push("representative = ?")
        params.push(username)
        updateFields.push("representative_id = ?")
        params.push(userId)
        
        // Add service time if calculated
        if (serviceTime) {
          updateFields.push("service_time = ?")
          params.push(serviceTime)
        }
      }
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
