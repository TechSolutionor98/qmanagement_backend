import pool from "./config/database.js";

async function checkUserSessionsTable() {
  try {
    console.log('🔍 Checking user_sessions table structure...\n');
    
    // Check table structure
    const [columns] = await pool.query('SHOW COLUMNS FROM user_sessions');
    
    console.log('📋 user_sessions Table Columns:');
    console.table(columns);
    
    // Check sample data
    const [sessions] = await pool.query('SELECT * FROM user_sessions LIMIT 5');
    
    console.log('\n📊 Sample Sessions:');
    console.table(sessions);
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkUserSessionsTable();
