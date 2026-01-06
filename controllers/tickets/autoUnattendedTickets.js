import pool from "../../config/database.js";
import { getAdminTimezone, convertUTCToTimezone } from "../../utils/timezoneHelper.js";

/**
 * Automatically mark tickets as "Unattended" after midnight
 * This function checks all tickets with status "Pending" or "Called" that were created before midnight
 * and marks them as "Unattended" based on each admin's timezone
 */
export const autoMarkUnattendedTickets = async () => {
  const connection = await pool.getConnection();
  try {
    console.log('🕐 [autoMarkUnattendedTickets] Running scheduled task to mark unattended tickets...');

    // Get all admins to process their timezones
    const [admins] = await connection.query("SELECT id, timezone FROM admin");
    
    let totalUpdated = 0;
    
    for (const admin of admins) {
      const adminId = admin.id;
      const adminTimezone = admin.timezone || '+05:00';
      
      // Get current time in admin's timezone
      const now = new Date();
      const currentTimeInTimezone = convertUTCToTimezone(now, adminTimezone);
      
      // Parse the time to get date and hour
      const [datePart, timePart] = currentTimeInTimezone.split(' ');
      
      console.log(`📋 [autoMarkUnattendedTickets] Admin ID: ${adminId}, Timezone: ${adminTimezone}`);
      console.log(`   Current time in admin's timezone: ${currentTimeInTimezone}`);
      console.log(`   Current date in admin's timezone: ${datePart}`);
      
      // Find tickets that:
      // 1. Belong to this admin
      // 2. Have status "Pending" or "Called"
      // 3. Were created on a date BEFORE today (not today)
      const [tickets] = await connection.query(
        `SELECT ticket_id, status, date, created_at 
         FROM tickets 
         WHERE admin_id = ? 
         AND (status = 'Pending' OR status = 'Called')
         AND date < ?`,
        [adminId, datePart]
      );
      
      console.log(`   Found ${tickets.length} tickets from previous days to mark as Unattended`);
      
      if (tickets.length > 0) {
        // Update all these tickets to "Unattended"
        const ticketIds = tickets.map(t => t.ticket_id);
        
        // Build the placeholders for the IN clause
        const placeholders = ticketIds.map(() => '?').join(',');
        
        const [result] = await connection.query(
          `UPDATE tickets 
           SET status = 'Unattended', 
               status_time = ?,
               last_updated = ?
           WHERE admin_id = ? 
           AND ticket_id IN (${placeholders})`,
          [currentTimeInTimezone, currentTimeInTimezone, adminId, ...ticketIds]
        );
        
        totalUpdated += result.affectedRows;
        
        console.log(`   ✅ Updated ${result.affectedRows} tickets to Unattended`);
        console.log(`   Tickets: ${ticketIds.join(', ')}`);
      }
    }
    
    console.log(`🎯 [autoMarkUnattendedTickets] Task completed. Total tickets updated: ${totalUpdated}`);
    
    return { success: true, totalUpdated };
  } catch (error) {
    console.error('❌ [autoMarkUnattendedTickets] Error:', error.message);
    return { success: false, error: error.message };
  } finally {
    connection.release();
  }
};

/**
 * Manual endpoint to trigger the auto-unattended task (for testing)
 */
export const triggerAutoUnattended = async (req, res) => {
  try {
    const result = await autoMarkUnattendedTickets();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
