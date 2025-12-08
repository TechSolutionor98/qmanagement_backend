import pool from './config/database.js';

async function testTicketInfoAPI() {
  try {
    console.log('🧪 Testing Ticket Info User APIs...\n');
    
    // Get first admin
    const [admins] = await pool.query('SELECT id FROM admin LIMIT 1');
    
    if (admins.length === 0) {
      console.log('❌ No admin found in database');
      return;
    }
    
    const adminId = admins[0].id;
    console.log('✅ Using Admin ID:', adminId);
    
    // Check license limits
    const [license] = await pool.query(
      'SELECT max_ticket_info_users FROM licenses WHERE admin_id = ?',
      [adminId]
    );
    
    if (license.length > 0) {
      console.log('📊 Max Ticket Info Users:', license[0].max_ticket_info_users);
    }
    
    // Check current ticket_info users
    const [currentUsers] = await pool.query(
      "SELECT COUNT(*) as count FROM user WHERE admin_id = ? AND role = 'ticket_info'",
      [adminId]
    );
    
    console.log('👥 Current Ticket Info Users:', currentUsers[0].count);
    
    // List all ticket_info users
    const [users] = await pool.query(
      `SELECT id, username, email, role, status, created_at 
       FROM user 
       WHERE admin_id = ? AND role = 'ticket_info'
       ORDER BY created_at DESC`,
      [adminId]
    );
    
    console.log('\n📋 Existing Ticket Info Users:');
    if (users.length === 0) {
      console.log('   No users found');
    } else {
      users.forEach(user => {
        console.log(`   - ${user.username} (${user.email}) - ID: ${user.id}`);
      });
    }
    
    console.log('\n✨ API endpoints ready:');
    console.log('   POST   /api/user/create-ticket-info');
    console.log('   GET    /api/user/ticket-info-users?adminId=' + adminId);
    console.log('   DELETE /api/user/:id');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error);
  } finally {
    await pool.end();
  }
}

testTicketInfoAPI();
