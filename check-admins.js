import pool from './config/database.js';

async function checkAdmins() {
  try {
    console.log('Checking admins in database...\n');
    
    const [admins] = await pool.query(
      'SELECT id, username, email, role FROM users WHERE role = "admin" ORDER BY id'
    );
    
    console.log('📋 Admins found:');
    console.table(admins);
    
    const [allUsers] = await pool.query(
      'SELECT id, username, email, role FROM users ORDER BY id'
    );
    
    console.log('\n📋 All users:');
    console.table(allUsers);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkAdmins();
