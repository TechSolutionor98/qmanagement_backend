import pool from '../config/database.js';

async function createServicesTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS services (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name_english VARCHAR(255) NOT NULL,
        name_arabic VARCHAR(255) NOT NULL,
        initial_ticket VARCHAR(10) NOT NULL,
        color VARCHAR(7) NOT NULL,
        logo_path VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    console.log('✅ Services table created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating services table:', error);
    process.exit(1);
  }
}

createServicesTable();
