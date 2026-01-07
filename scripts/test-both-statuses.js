import dotenv from 'dotenv';
import pool from '../config/database.js';

dotenv.config();

async function testBothStatuses() {
  const connection = await pool.getConnection();
  
  try {
    console.log('\n🧪 Testing Both Pending AND Called Status (Case-Insensitive)\n');
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    console.log('📝 Creating test tickets from yesterday...\n');
    
    // Test 1: lowercase "called"
    await connection.query(`
      INSERT INTO tickets 
      (ticket_id, counter_no, service_name, time, date, status, admin_id, created_at, reason, name, email, number)
      VALUES ('TEST-CALLED', '1', 'Test Service', '10:00:00', ?, 'called', 13, NOW(), '', '', '', '')
    `, [yesterdayStr]);
    console.log('   ✅ Created: TEST-CALLED with status "called" (lowercase)');
    
    // Test 2: Uppercase "Pending"
    await connection.query(`
      INSERT INTO tickets 
      (ticket_id, counter_no, service_name, time, date, status, admin_id, created_at, reason, name, email, number)
      VALUES ('TEST-PENDING', '1', 'Test Service', '10:00:00', ?, 'Pending', 13, NOW(), '', '', '', '')
    `, [yesterdayStr]);
    console.log('   ✅ Created: TEST-PENDING with status "Pending" (capital P)');
    
    // Test 3: lowercase "pending"
    await connection.query(`
      INSERT INTO tickets 
      (ticket_id, counter_no, service_name, time, date, status, admin_id, created_at, reason, name, email, number)
      VALUES ('TEST-PENDING2', '1', 'Test Service', '10:00:00', ?, 'pending', 13, NOW(), '', '', '', '')
    `, [yesterdayStr]);
    console.log('   ✅ Created: TEST-PENDING2 with status "pending" (lowercase)');
    
    // Test 4: Uppercase "Called"
    await connection.query(`
      INSERT INTO tickets 
      (ticket_id, counter_no, service_name, time, date, status, admin_id, created_at, reason, name, email, number)
      VALUES ('TEST-CALLED2', '1', 'Test Service', '10:00:00', ?, 'Called', 13, NOW(), '', '', '', '')
    `, [yesterdayStr]);
    console.log('   ✅ Created: TEST-CALLED2 with status "Called" (capital C)');
    
    // Check if all are detected
    const [beforeUpdate] = await connection.query(`
      SELECT ticket_id, status, date
      FROM tickets 
      WHERE ticket_id LIKE 'TEST-%'
      AND admin_id = 13
      AND (LOWER(status) = 'pending' OR LOWER(status) = 'called')
      AND date < CURDATE()
      ORDER BY ticket_id
    `);
    
    console.log('\n🔍 Tickets found with case-insensitive query:', beforeUpdate.length);
    console.log('\n📋 Before Update:');
    beforeUpdate.forEach(t => {
      console.log(`   - ${t.ticket_id} | Status: "${t.status}"`);
    });
    
    // Run auto-unattended
    console.log('\n⏰ Running auto-unattended task...\n');
    const { autoMarkUnattendedTickets } = await import('../controllers/tickets/autoUnattendedTickets.js');
    const updateResult = await autoMarkUnattendedTickets();
    
    console.log('\n📊 Update Result:');
    console.log('   Success:', updateResult.success);
    console.log('   Total Updated:', updateResult.totalUpdated);
    
    // Check after update
    const [afterUpdate] = await connection.query(`
      SELECT ticket_id, status
      FROM tickets 
      WHERE ticket_id LIKE 'TEST-%'
      ORDER BY ticket_id
    `);
    
    console.log('\n📋 After Update:');
    let allUpdated = true;
    afterUpdate.forEach(t => {
      const emoji = t.status === 'Unattended' ? '✅' : '❌';
      console.log(`   ${emoji} ${t.ticket_id} | Status: "${t.status}"`);
      if (t.status !== 'Unattended') allUpdated = false;
    });
    
    if (allUpdated && afterUpdate.length === 4) {
      console.log('\n🎯 ✅ SUCCESS! Sab tickets (Pending aur Called dono) Unattended mark ho gayi!');
      console.log('   - lowercase "called" ✅');
      console.log('   - Capital "Called" ✅');
      console.log('   - lowercase "pending" ✅');
      console.log('   - Capital "Pending" ✅');
    } else {
      console.log('\n❌ FAILED! Kuch tickets update nahi hui');
    }
    
    // Cleanup
    await connection.query(`DELETE FROM tickets WHERE ticket_id LIKE 'TEST-%'`);
    console.log('\n🧹 Test tickets cleaned up');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    // Cleanup on error
    try {
      await connection.query(`DELETE FROM tickets WHERE ticket_id LIKE 'TEST-%'`);
    } catch (e) {
      // Ignore
    }
    
    process.exit(1);
  } finally {
    connection.release();
  }
}

testBothStatuses();
