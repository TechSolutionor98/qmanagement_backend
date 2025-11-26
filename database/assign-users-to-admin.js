import pool from '../config/database.js';

async function assignUsersToAdmin() {
  try {
    // Check users without admin_id
    const [usersWithoutAdmin] = await pool.query(
      'SELECT id, username, email FROM users WHERE admin_id IS NULL'
    );
    
    console.log(`Found ${usersWithoutAdmin.length} users without admin_id`);
    
    if (usersWithoutAdmin.length > 0) {
      // Assign all users to admin with id=2 (default admin)
      const [result] = await pool.query(
        'UPDATE users SET admin_id = 2 WHERE admin_id IS NULL'
      );
      
      console.log(`✅ Assigned ${result.affectedRows} users to admin (id=2)`);
    } else {
      console.log('✅ All users already have admin_id assigned');
    }
    
    // Show all users with their admin_id
    const [allUsers] = await pool.query(
      'SELECT id, username, email, admin_id FROM users ORDER BY admin_id, username'
    );
    
    console.log('\nAll users:');
    console.table(allUsers);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

assignUsersToAdmin();
