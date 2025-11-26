import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'queue_management'
});

async function addAdminIdColumn() {
  try {
    // Add admin_id column to users table
    await pool.query('ALTER TABLE users ADD COLUMN admin_id INT NULL AFTER id');
    console.log('✅ admin_id column added to users table successfully');
    
    // Add foreign key constraint
    await pool.query('ALTER TABLE users ADD CONSTRAINT fk_users_admin FOREIGN KEY (admin_id) REFERENCES admin(id) ON DELETE CASCADE');
    console.log('✅ Foreign key constraint added successfully');
    
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('ℹ️  admin_id column already exists in users table');
    } else if (error.code === 'ER_DUP_KEYNAME') {
      console.log('ℹ️  Foreign key constraint already exists');
    } else {
      console.error('❌ Error:', error.message);
    }
  } finally {
    await pool.end();
  }
}

addAdminIdColumn();
