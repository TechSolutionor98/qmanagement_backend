/**
 * Test script to verify auto-unattended tickets functionality
 * Run this to manually trigger the task and see the results
 */
import { autoMarkUnattendedTickets } from '../controllers/tickets/autoUnattendedTickets.js';
import pool from '../config/database.js';

async function testAutoUnattended() {
  console.log('\n🧪 Testing Auto-Unattended Tickets Functionality\n');
  console.log('='.repeat(60));
  
  try {
    // First, show current pending/called tickets
    console.log('\n📋 Current Pending/Called Tickets:');
    const [tickets] = await pool.query(`
      SELECT ticket_id, service_name, status, date, created_at, admin_id 
      FROM tickets 
      WHERE status IN ('Pending', 'Called')
      ORDER BY admin_id, date DESC
      LIMIT 20
    `);
    
    if (tickets.length === 0) {
      console.log('   No pending or called tickets found.');
    } else {
      console.table(tickets);
    }
    
    // Show admin timezones
    console.log('\n🌍 Admin Timezones:');
    const [admins] = await pool.query('SELECT id, username, timezone FROM admin');
    console.table(admins);
    
    // Run the auto-unattended task
    console.log('\n⏰ Running auto-unattended task...\n');
    const result = await autoMarkUnattendedTickets();
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 Task Result:');
    console.log('   Success:', result.success);
    console.log('   Total Updated:', result.totalUpdated);
    
    // Show updated tickets
    if (result.totalUpdated > 0) {
      console.log('\n📋 Recently Updated to Unattended:');
      const [updatedTickets] = await pool.query(`
        SELECT ticket_id, service_name, status, date, status_time, admin_id 
        FROM tickets 
        WHERE status = 'Unattended'
        ORDER BY status_time DESC
        LIMIT 20
      `);
      console.table(updatedTickets);
    }
    
    console.log('\n✅ Test completed successfully!\n');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
  } finally {
    process.exit(0);
  }
}

// Run the test
testAutoUnattended();
