import pool from "./config/database.js";

async function checkLatestUsers() {
  try {
    console.log('🔍 Checking Latest Users...\n');
    
    // Check all recent users
    const [users] = await pool.query(
      `SELECT id, username, email, role, admin_id, status, created_at 
       FROM users 
       ORDER BY created_at DESC 
       LIMIT 10`
    );

    if (users.length === 0) {
      console.log('❌ No users found');
    } else {
      console.log('✅ Latest 10 Users:');
      console.table(users);
    }

    // Check role column definition
    console.log('\n📋 Role Column Definition:');
    const [columns] = await pool.query(
      `SHOW COLUMNS FROM users WHERE Field = 'role'`
    );
    console.log('Type:', columns[0].Type);
    console.log('Null:', columns[0].Null);
    console.log('Default:', columns[0].Default);

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkLatestUsers();
