import pool from './config/database.js';

async function checkAdminTable() {
  try {
    console.log('Checking admins table...\n');
    
    // Check if admins table exists
    const [tables] = await pool.query("SHOW TABLES LIKE 'admins'");
    
    if (tables.length === 0) {
      console.log('❌ Admins table does NOT exist\n');
    } else {
      console.log('✅ Admins table exists\n');
      
      // Get all admins
      const [admins] = await pool.query('SELECT * FROM admins ORDER BY id');
      
      console.log('📋 All admins in admins table:');
      console.table(admins);
      
      console.log(`\nTotal admins: ${admins.length}`);
    }
    
    // Also check users table for role='admin'
    console.log('\n📋 Users with role="admin" in users table:');
    const [adminUsers] = await pool.query(
      'SELECT id, username, email, role FROM users WHERE role = "admin" ORDER BY id'
    );
    console.table(adminUsers);
    console.log(`\nTotal admin users: ${adminUsers.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkAdminTable();
