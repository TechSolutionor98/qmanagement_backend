import pool from '../config/database.js';

async function addColumn() {
  let connection;
  try {
    connection = await pool.getConnection();
    
    console.log('🔍 Checking if column exists...');
    
    // Check if column already exists
    const [columns] = await connection.query(`
      SHOW COLUMNS FROM tickets LIKE 'called_by_user_id'
    `);
    
    if (columns.length > 0) {
      console.log('✅ Column called_by_user_id already exists!');
      return;
    }
    
    console.log('➕ Adding called_by_user_id column...');
    
    // Add the column
    await connection.query(`
      ALTER TABLE tickets 
      ADD COLUMN called_by_user_id INT NULL AFTER caller
    `);
    
    console.log('✅ Column added successfully!');
    
    // Add index
    console.log('📊 Adding index...');
    await connection.query(`
      ALTER TABLE tickets 
      ADD INDEX idx_called_by_user_id (called_by_user_id)
    `);
    
    console.log('✅ Index added successfully!');
    
    // Migrate existing data
    console.log('📦 Migrating existing data...');
    const [result] = await connection.query(`
      UPDATE tickets 
      SET called_by_user_id = caller 
      WHERE caller IS NOT NULL AND called_at IS NOT NULL
    `);
    
    console.log(`✅ Migrated ${result.affectedRows} rows!`);
    
    // Verify
    const [verifyColumns] = await connection.query(`
      SHOW COLUMNS FROM tickets WHERE Field = 'called_by_user_id'
    `);
    
    console.log('\n✅ Verification:');
    console.log(verifyColumns[0]);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    if (connection) connection.release();
    process.exit(1);
  } finally {
    await pool.end();
  }
}

addColumn();
