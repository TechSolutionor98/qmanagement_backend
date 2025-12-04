import pool from "../../config/database.js"

export const getUserAssignedTickets = async (req, res) => {
  const userId = req.user?.id

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  const connection = await pool.getConnection()
  try {
    // Get user's assigned services
    const [assignedServices] = await connection.query(
      `SELECT service_id FROM user_services WHERE user_id = ?`,
      [userId]
    )

    if (assignedServices.length === 0) {
      return res.json({ 
        success: true, 
        tickets: [], 
        message: "No services assigned to this user" 
      })
    }

    const serviceIds = assignedServices.map(s => s.service_id)

    // Get service names for these IDs
    const [services] = await connection.query(
      `SELECT id, service_name as name FROM services WHERE id IN (${serviceIds.join(',')})`,
      []
    )

    const serviceMap = {}
    services.forEach(s => {
      serviceMap[s.id] = s.name
    })

    // Get tickets for these services with status filter
    const status = req.query.status || 'Pending' // Default to pending tickets
    const today = req.query.today === 'true'

    // Get current user's username for checking transferred tickets
    const [currentUser] = await connection.query(
      `SELECT username FROM users WHERE id = ?`,
      [userId]
    )
    const username = currentUser[0]?.username || ''

    let ticketQuery = `
      SELECT 
        t.id,
        t.ticket_id as ticketNumber,
        t.service_name as service,
        t.time as submissionTime,
        t.date as submissionDate,
        t.status,
        t.name,
        t.email,
        t.number,
        t.representative,
        t.caller,
        t.calling_time,
        t.calling_user_time,
        t.locked_by,
        t.transfered,
        t.transfer_by,
        CASE 
          WHEN t.transfered = ? AND t.transfer_by IS NOT NULL AND t.transfer_by != '' 
          THEN 'transferred_to_me'
          ELSE 'regular'
        END as ticket_type
      FROM tickets t
      WHERE (
        (
          t.service_name IN (${services.map(s => '?').join(',')})
          AND (t.status = ? OR (t.status = 'called' AND t.caller = ?))
          AND (t.transfered IS NULL OR t.transfered = '' OR t.transfered != ?)
          AND (t.transfer_by IS NULL OR t.transfer_by = '' OR t.transfer_by != ?)
          AND (
            (t.caller = ? OR (t.caller IS NULL OR t.caller = '' OR t.caller = 0))
            AND (t.locked_by IS NULL OR t.locked_by = 0 OR t.locked_by = ? || t.locked_by = '')
          )
        )
        OR
        (
          t.transfered = ?
          AND t.transfer_by IS NOT NULL 
          AND t.transfer_by != ''
          AND t.transfer_by != ?
          AND (
            t.status = 'Pending' 
            OR (t.status = 'called' AND t.caller = ?)
          )
          AND (
            (t.caller IS NULL OR t.caller = '' OR t.caller = 0)
            OR (t.caller = ?)
          )
          AND (t.locked_by IS NULL OR t.locked_by = 0 OR t.locked_by = '')
        )
      )
    `

    const params = [username, ...services.map(s => s.name), status, username, username, username, username, userId, username, username, username, username]

    if (today) {
      ticketQuery += ` AND DATE(t.date) = CURDATE()`
    }

    ticketQuery += ` ORDER BY t.created_at ASC`

    const [tickets] = await connection.query(ticketQuery, params)

    console.log(`[getUserAssignedTickets] User ${userId} (username: ${username}) fetched ${tickets.length} tickets`)
    if (tickets.length > 0) {
      console.log(`[getUserAssignedTickets] Sample: ${tickets[0].ticketNumber}, caller: ${tickets[0].caller}, locked_by: ${tickets[0].locked_by}, transfer_by: ${tickets[0].transfer_by}`)
      console.log(`[getUserAssignedTickets] First 3 tickets with transfer info:`)
      tickets.slice(0, 3).forEach(t => {
        console.log(`  - ${t.ticketNumber}: caller=${t.caller}, status=${t.status}, transfer_by=${t.transfer_by}, transfered=${t.transfered}`)
      })
    }

    res.json({ 
      success: true, 
      tickets,
      assignedServices: services,
      totalPending: tickets.length
    })
  } catch (error) {
    console.error("[getUserAssignedTickets] error", error)
    res.status(500).json({ success: false, message: "Internal server error" })
  } finally {
    connection.release()
  }
}
