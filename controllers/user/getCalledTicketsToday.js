import db from '../../config/database.js';

export const getCalledTicketsToday = async (req, res) => {
  try {
    const userId = req.user.id;
    
    console.log('📅 Fetching called tickets for user:', userId);
    
    // Query to get all tickets called by this user (verified by called_by_user_id)
    const query = `
      SELECT 
        t.id,
        t.ticket_id as ticket_number,
        t.service_name,
        t.status,
        t.called_at as call_time,
        t.counter_no,
        t.caller,
        DATE(t.called_at) as call_date
      FROM tickets t
      WHERE t.caller = ?
        AND t.called_at IS NOT NULL
        AND (t.transfered IS NULL OR t.transfered = '')
        AND DATE(t.called_at) = CURDATE()
      ORDER BY t.called_at DESC
    `;
    
    const [tickets] = await db.query(query, [userId]);
    
    console.log(`✅ Found ${tickets.length} called tickets for user ${userId} today`);
    
    res.json({
      success: true,
      tickets: tickets,
      count: tickets.length
    });
    
  } catch (error) {
    console.error('[getCalledTicketsToday] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch called tickets',
      error: error.message
    });
  }
};
