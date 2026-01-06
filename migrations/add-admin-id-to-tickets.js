import pool from "../config/database.js";

/**
 * Migration: Add admin_id column to tickets table if it doesn't exist
 * This is required for multi-tenant support and timezone-based auto-unattended feature
 */
async function addAdminIdToTickets() {
  const connection = await pool.getConnection();
  try {
    console.log('🔧 Checking if admin_id column exists in tickets table...');
    
    // Check if admin_id column already exists
    const [columns] = await connection.query(
      "SHOW COLUMNS FROM tickets LIKE 'admin_id'"
    );
    
    if (columns.length > 0) {
      console.log('✅ admin_id column already exists in tickets table');
      return;
    }
    
    console.log('📝 Adding admin_id column to tickets table...');
    
    // Add admin_id column
    await connection.query(`
      ALTER TABLE tickets 
      ADD COLUMN admin_id INT(11) DEFAULT NULL AFTER id,
      ADD KEY idx_tickets_admin_id (admin_id),
      ADD CONSTRAINT fk_tickets_admin FOREIGN KEY (admin_id) REFERENCES admin(id) ON DELETE SET NULL
    `);
    
    console.log('✅ admin_id column added successfully to tickets table');
    
    // Update existing tickets with admin_id based on user's admin_id
    console.log('📝 Updating existing tickets with admin_id...');
    
    await connection.query(`
      UPDATE tickets t
      INNER JOIN users u ON t.called_by_user_id = u.id
      SET t.admin_id = u.admin_id
      WHERE t.admin_id IS NULL AND t.called_by_user_id IS NOT NULL
    `);
    
    console.log('✅ Existing tickets updated with admin_id');
    
  } catch (error) {
    console.error('❌ Error adding admin_id to tickets:', error.message);
    throw error;
  } finally {
    connection.release();
  }
}

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  addAdminIdToTickets()
    .then(() => {
      console.log('\n✅ Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Migration failed:', error);
      process.exit(1);
    });
}

export { addAdminIdToTickets };
