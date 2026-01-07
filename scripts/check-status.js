import dotenv from 'dotenv';
import pool from '../config/database.js';

dotenv.config();

async function checkStatus() {
  try {
    // Get distinct statuses
    const [statuses] = await pool.query('SELECT DISTINCT status FROM tickets ORDER BY status');
    console.log('\n📊 Distinct statuses in database:');
    statuses.forEach(r => console.log('   -', r.status));
    
    // Count pending/called tickets
    const [pending] = await pool.query(
      'SELECT COUNT(*) as count FROM tickets WHERE status = ? OR status = ?',
      ['Pending', 'Called']
    );
    console.log('\n📋 Total Pending/Called tickets:', pending[0].count);
    
    // Check tickets from before today
    const [yesterday] = await pool.query(`
      SELECT COUNT(*) as count, MIN(date) as oldest_date 
      FROM tickets 
      WHERE (status = ? OR status = ?) 
      AND date < CURDATE()
    `, ['Pending', 'Called']);
    
    console.log('\n🔍 Tickets from before today with Pending/Called status:', yesterday[0].count);
    console.log('   Oldest date:', yesterday[0].oldest_date);
    
    // Show sample of old pending/called tickets
    const [samples] = await pool.query(`
      SELECT ticket_id, status, date, created_at, admin_id
      FROM tickets 
      WHERE (status = ? OR status = ?) 
      AND date < CURDATE()
      LIMIT 10
    `, ['Pending', 'Called']);
    
    if (samples.length > 0) {
      console.log('\n📝 Sample old tickets:');
      samples.forEach(t => {
        console.log(`   - ${t.ticket_id} | ${t.status} | ${t.date} | Admin: ${t.admin_id}`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkStatus();
