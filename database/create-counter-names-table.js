import pool from '../config/database.js';

export async function createCounterNamesTable() {
  const connection = await pool.getConnection();
  try {
    console.log('🔧 Creating admin_counter_names table if not exists...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS admin_counter_names (
        id INT AUTO_INCREMENT PRIMARY KEY,
        admin_id INT NOT NULL,
        counter_no INT NOT NULL,
        counter_name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_admin_counter (admin_id, counter_no),
        FOREIGN KEY (admin_id) REFERENCES admin(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ admin_counter_names table ready!');
  } catch (error) {
    console.error('❌ Error creating admin_counter_names table:', error.message);
  } finally {
    connection.release();
  }
}

if (process.argv[1] && process.argv[1].endsWith('create-counter-names-table.js')) {
  createCounterNamesTable().then(() => process.exit(0));
}
