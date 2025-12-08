import pool from './config/database.js';

async function addMissingColumn() {
  try {
    console.log('Adding max_receptionists column...');
    await pool.query(`
      ALTER TABLE licenses 
      ADD COLUMN max_receptionists INT DEFAULT 5 
      COMMENT 'Maximum number of reception role users allowed'
    `);
    console.log('✅ Successfully added max_receptionists column');
    
    // Verify all columns
    const [columns] = await pool.query(`
      SHOW COLUMNS FROM licenses 
      WHERE Field IN ('max_receptionists', 'max_ticket_info_users', 'max_sessions_per_receptionist', 'max_sessions_per_ticket_info')
    `);
    
    console.log('\n📊 All session limit columns:');
    columns.forEach(col => {
      console.log(`   ✅ ${col.Field}: ${col.Type} (Default: ${col.Default})`);
    });
    
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('✅ Column already exists!');
    } else {
      console.error('❌ Error:', error.message);
    }
  } finally {
    await pool.end();
  }
}

addMissingColumn();
