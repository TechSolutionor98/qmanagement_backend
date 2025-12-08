import pool from "./config/database.js";

async function addTicketInfoRole() {
  try {
    console.log('🔧 Adding ticket_info role to users table...\n');
    
    // Alter the enum to include ticket_info
    await pool.query(`
      ALTER TABLE users 
      MODIFY COLUMN role ENUM('user', 'receptionist', 'ticket_info', 'admin', 'super_admin') 
      DEFAULT 'user'
    `);

    console.log('✅ Successfully added ticket_info to role enum');

    // Verify the change
    const [columns] = await pool.query(
      `SHOW COLUMNS FROM users WHERE Field = 'role'`
    );
    
    console.log('\n📋 Updated Role Column:');
    console.table(columns);

    // Update existing user with empty role
    const [updateResult] = await pool.query(
      `UPDATE users SET role = 'ticket_info' WHERE role = '' OR role IS NULL`
    );

    if (updateResult.affectedRows > 0) {
      console.log(`\n🔄 Updated ${updateResult.affectedRows} users with empty role to ticket_info`);
    }

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addTicketInfoRole();
