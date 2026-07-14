import pool from "../../config/database.js"

export const updateTicketSettings = async (req, res) => {
  try {
    const { adminId } = req.params
    const { 
      company_name, 
      ticket_waiting_message, 
      ticket_thank_you_text, 
      ticket_footer_text,
      ticket_layout
    } = req.body

    const userId = req.user.id
    const userRole = req.user.role

    // Authorization: only super_admin or the specific admin themselves
    if (userRole === 'admin' && parseInt(userId) !== parseInt(adminId)) {
      return res.status(403).json({
        success: false,
        message: "You can only update settings for your own license"
      })
    }

    if (!adminId) {
      return res.status(400).json({
        success: false,
        message: "Admin ID is required"
      })
    }

    // Build fields to update dynamically
    const fieldsToUpdate = []
    const values = []

    if (company_name !== undefined) {
      fieldsToUpdate.push("company_name = ?")
      values.push(company_name)
    }
    if (ticket_waiting_message !== undefined) {
      fieldsToUpdate.push("ticket_waiting_message = ?")
      values.push(ticket_waiting_message)
    }
    if (ticket_thank_you_text !== undefined) {
      fieldsToUpdate.push("ticket_thank_you_text = ?")
      values.push(ticket_thank_you_text)
    }
    if (ticket_footer_text !== undefined) {
      fieldsToUpdate.push("ticket_footer_text = ?")
      values.push(ticket_footer_text)
    }
    if (ticket_layout !== undefined) {
      fieldsToUpdate.push("ticket_layout = ?")
      values.push(ticket_layout)
    }

    if (fieldsToUpdate.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields to update provided"
      })
    }

    // Add adminId to the values array for the WHERE clause
    values.push(adminId)

    const updateQuery = `
      UPDATE licenses 
      SET ${fieldsToUpdate.join(", ")}, updated_at = NOW() 
      WHERE admin_id = ?
    `

    const [result] = await pool.query(updateQuery, values)

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "License not found for this admin"
      })
    }

    res.status(200).json({
      success: true,
      message: "Ticket print settings updated successfully"
    })
  } catch (error) {
    console.error("Update ticket settings error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to update ticket settings",
      error: error.message
    })
  }
}
