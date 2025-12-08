import pool from './config/database.js';

async function testUpdate() {
  try {
    console.log('🧪 Testing License Update...\n');
    
    // Get first license
    const [licenses] = await pool.query('SELECT * FROM licenses LIMIT 1');
    
    if (licenses.length === 0) {
      console.log('❌ No licenses found in database');
      return;
    }
    
    const license = licenses[0];
    console.log('📦 Current License Data:');
    console.log('   ID:', license.id);
    console.log('   Company:', license.company_name);
    console.log('   Max Users:', license.max_users);
    console.log('   Max Counters:', license.max_counters);
    console.log('   Max Receptionists:', license.max_receptionists);
    console.log('   Max Ticket Info Users:', license.max_ticket_info_users);
    console.log('   Sessions/Receptionist:', license.max_sessions_per_receptionist);
    console.log('   Sessions/Ticket Info:', license.max_sessions_per_ticket_info);
    
    // Test update
    console.log('\n🔄 Testing Update...');
    const [result] = await pool.query(
      `UPDATE licenses 
       SET max_receptionists = ?, 
           max_ticket_info_users = ?,
           max_sessions_per_receptionist = ?,
           max_sessions_per_ticket_info = ?,
           updated_at = NOW()
       WHERE id = ?`,
      [10, 5, 2, 3, license.id]
    );
    
    console.log('✅ Update Result:', result.affectedRows, 'row(s) affected');
    
    // Verify update
    const [updated] = await pool.query('SELECT * FROM licenses WHERE id = ?', [license.id]);
    console.log('\n✅ Updated License Data:');
    console.log('   Max Receptionists:', updated[0].max_receptionists);
    console.log('   Max Ticket Info Users:', updated[0].max_ticket_info_users);
    console.log('   Sessions/Receptionist:', updated[0].max_sessions_per_receptionist);
    console.log('   Sessions/Ticket Info:', updated[0].max_sessions_per_ticket_info);
    
    console.log('\n✨ Update test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error);
  } finally {
    await pool.end();
  }
}

testUpdate();
