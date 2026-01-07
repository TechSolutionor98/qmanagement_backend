import dotenv from 'dotenv';
import pool from '../config/database.js';

dotenv.config();

async function testCaseInsensitive() {
  const connection = await pool.getConnection();
  
  try {
    console.log('\n🧪 Testing Case-Insensitive Status Matching\n');
    
    // Create a test ticket with lowercase 'called' status from yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    console.log('📝 Creating test ticket with lowercase "called" status from yesterday...');
    
    const [result] = await connection.query(`
      INSERT INTO tickets 
      (ticket_id, counter_no, service_name, time, date, status, admin_id, created_at, reason, name, email, number)
      VALUES ('TEST-001', '1', 'Test Service', '10:00:00', ?, 'called', 13, NOW(), '', '', '', '')
    `, [yesterdayStr]);
    
    console.log('   ✅ Test ticket created: TEST-001');
    
    // Now check if the query can find it
    const [beforeUpdate] = await connection.query(`
      SELECT ticket_id, status, date
      FROM tickets 
      WHERE admin_id = 13
      AND (LOWER(status) = 'pending' OR LOWER(status) = 'called')
      AND date < CURDATE()
    `);
    
    console.log('\n🔍 Tickets found with case-insensitive query:', beforeUpdate.length);
    if (beforeUpdate.length > 0) {
      console.log('   ✅ SUCCESS! Found ticket with lowercase "called" status:');
      beforeUpdate.forEach(t => {
        console.log(`      - ${t.ticket_id} | Status: "${t.status}" | Date: ${t.date}`);
      });
    }
    
    // Run the auto-unattended function
    console.log('\n⏰ Running auto-unattended task...\n');
    const { autoMarkUnattendedTickets } = await import('../controllers/tickets/autoUnattendedTickets.js');
    const updateResult = await autoMarkUnattendedTickets();
    
    console.log('\n📊 Update Result:');
    console.log('   Success:', updateResult.success);
    console.log('   Total Updated:', updateResult.totalUpdated);
    
    // Check if the ticket was updated
    const [afterUpdate] = await connection.query(`
      SELECT ticket_id, status, date
      FROM tickets 
      WHERE ticket_id = 'TEST-001'
    `);
    
    if (afterUpdate.length > 0) {
      console.log('\n✅ Test ticket after update:');
      console.log(`   - ${afterUpdate[0].ticket_id} | Status: "${afterUpdate[0].status}"`);
      
      if (afterUpdate[0].status === 'Unattended') {
        console.log('\n🎯 ✅ SUCCESS! Fix is working correctly!');
        console.log('   The lowercase "called" status was properly detected and updated to "Unattended"');
      } else {
        console.log('\n❌ FAILED! Status was not updated to Unattended');
      }
    }
    
    // Clean up - delete test ticket
    await connection.query(`DELETE FROM tickets WHERE ticket_id = 'TEST-001'`);
    console.log('\n🧹 Test ticket cleaned up');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    
    // Clean up on error
    try {
      await connection.query(`DELETE FROM tickets WHERE ticket_id = 'TEST-001'`);
    } catch (e) {
      // Ignore cleanup errors
    }
    
    process.exit(1);
  } finally {
    connection.release();
  }
}

testCaseInsensitive();
