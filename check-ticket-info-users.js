import pool from "./config/database.js";

async function checkTicketInfoUsers() {
  try {
    console.log('🔍 Checking Ticket Info Users...\n');
    
    // Check all ticket_info users
    const [users] = await pool.query(
      `SELECT id, username, email, role, admin_id, status, created_at 
       FROM users 
       WHERE role = 'ticket_info' OR username LIKE 'receptonnn%'
       ORDER BY created_at DESC 
       LIMIT 10`
    );

    if (users.length === 0) {
      console.log('❌ No ticket_info users found');
    } else {
      console.log('✅ Ticket Info Users:');
      console.table(users);
    }

    // Check users table structure
    console.log('\n📋 Users Table Structure (role column):');
    const [columns] = await pool.query(
      `SHOW COLUMNS FROM users WHERE Field = 'role'`
    );
    console.table(columns);

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkTicketInfoUsers();
