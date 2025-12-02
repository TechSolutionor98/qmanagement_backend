import pool from "../../config/database.js"

export const getCompletedTickets = async (req, res) => {
  const userId = req.user.userId || req.user.id
  const { start_date, end_date } = req.query

  try {
    console.log(`📋 Fetching completed tickets for user ID: ${userId}`)
    console.log(`📅 Date range: ${start_date || 'all'} to ${end_date || 'all'}`)

    let query = `
      SELECT 
        t.id,
        t.ticket_id as ticket_number,
        t.service_name,
        t.status,
        t.created_at as ticket_created_time,
        t.called_at as called_time,
        t.counter_no as solved_by_counter,
        t.caller,
        t.transfered as transfer_info,
        t.transfer_by
      FROM tickets t
      WHERE t.caller = ?
        AND t.called_at IS NOT NULL
    `
    const params = [userId]

    // Add date filters if provided
    if (start_date && end_date) {
      query += ` AND DATE(t.created_at) BETWEEN ? AND ?`
      params.push(start_date, end_date)
    } else if (start_date) {
      query += ` AND DATE(t.created_at) >= ?`
      params.push(start_date)
    } else if (end_date) {
      query += ` AND DATE(t.created_at) <= ?`
      params.push(end_date)
    }

    query += ` ORDER BY t.called_at DESC, t.created_at DESC`

    const [tickets] = await pool.query(query, params)

    // Format tickets for frontend
    const formattedTickets = tickets.map(ticket => ({
      id: ticket.id,
      ticketNumber: ticket.ticket_number,
      service: ticket.service_name,
      status: ticket.status,
      ticketCreatedTime: ticket.ticket_created_time,
      calledTime: ticket.called_time,
      statusUpdateTime: ticket.called_time || ticket.ticket_created_time, // Use called_time as update time
      calledCount: 0, // Default since column doesn't exist
      transferInfo: ticket.transfer_info || 'Not Transferred',
      transferTime: ticket.transfer_time || '0000-00-00 00:00:00',
      solvedBy: ticket.solved_by_counter || ticket.counter_no
    }))

    console.log(`✅ Found ${formattedTickets.length} completed tickets`)

    res.json({ 
      success: true, 
      tickets: formattedTickets,
      count: formattedTickets.length,
      filters: {
        startDate: start_date || null,
        endDate: end_date || null
      }
    })
  } catch (error) {
    console.error('[getCompletedTickets] Error:', error)
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch completed tickets",
      error: error.message 
    })
  }
}
