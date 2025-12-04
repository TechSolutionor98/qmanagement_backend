import db from '../../config/database.js';

export const getCalledTicketsToday = async (req, res) => {
  try {
    const userId = req.user.id;
    
    console.log('📅 Fetching called tickets for user:', userId);
    
    // Get username for this user
    const [users] = await db.query(
      'SELECT username FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const username = users[0].username;
    console.log('👤 Username:', username);
    
    // Query to get all tickets called by this user today
    const query = `
      SELECT 
        t.id as ticket_id,
        t.ticket_id as ticket_number,
        t.service_name,
        t.status,
        t.calling_user_time as call_time,
        t.counter_no,
        t.caller,
        DATE(t.calling_user_time) as call_date
      FROM tickets t
      WHERE t.caller = ?
        AND t.calling_user_time IS NOT NULL
        AND DATE(t.calling_user_time) = CURDATE()
      ORDER BY t.calling_user_time DESC
    `;
    
    const [tickets] = await db.query(query, [username]);
    
    console.log(`✅ Found ${tickets.length} called tickets for user ${username} today`);
    
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
