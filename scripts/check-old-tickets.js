import dotenv from 'dotenv';
import pool from '../config/database.js';

dotenv.config();

async function checkOldTickets() {
  try {
    // Check for old tickets with called/pending status (case-insensitive)
    const [oldTickets] = await pool.query(`
      SELECT ticket_id, status, date, created_at, admin_id
      FROM tickets 
      WHERE (LOWER(status) = 'pending' OR LOWER(status) = 'called')
      AND date < CURDATE()
      ORDER BY date DESC
      LIMIT 20
    `);
    
    console.log('\n🔍 Old tickets with Pending/Called status (before today):');
    console.log('   Total found:', oldTickets.length);
    
    if (oldTickets.length > 0) {
      console.log('\n📋 Details:');
      oldTickets.forEach(t => {
        console.log(`   - ${t.ticket_id} | Status: "${t.status}" | Date: ${t.date} | Admin: ${t.admin_id}`);
      });
    } else {
      console.log('   ✅ No old tickets found with Pending/Called status');
      console.log('   This means either:');
      console.log('   1. All old tickets were already marked as Unattended');
      console.log('   2. OR All current tickets are from today');
    }
    
    // Check all tickets from yesterday or earlier
    const [allOldTickets] = await pool.query(`
      SELECT COUNT(*) as count, 
             MIN(date) as oldest,
             MAX(date) as newest
      FROM tickets 
      WHERE date < CURDATE()
    `);
    
    console.log('\n📊 All tickets before today:');
    console.log('   Total count:', allOldTickets[0].count);
    console.log('   Oldest date:', allOldTickets[0].oldest);
    console.log('   Newest date:', allOldTickets[0].newest);
    
    // Check if there are any tickets at all
    const [totalTickets] = await pool.query('SELECT COUNT(*) as count FROM tickets');
    console.log('\n📝 Total tickets in database:', totalTickets[0].count);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkOldTickets();
