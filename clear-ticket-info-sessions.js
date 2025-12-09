import pool from "./config/database.js";

async function clearUserSessions() {
  try {
    console.log('🧹 Clearing user sessions for ticket_info users...\n');
    
    // Clear sessions for user IDs 7 and 9
    const [result] = await pool.query(
      'UPDATE user_sessions SET active = 0 WHERE user_id IN (7, 9)'
    );
    
    console.log(`✅ Deactivated ${result.affectedRows} session(s)`);
    
    // Verify
    const [sessions] = await pool.query(
      'SELECT user_id, username, active, expires_at FROM user_sessions WHERE user_id IN (7, 9)'
    );
    
    console.log('\n📋 Current sessions:');
    console.table(sessions);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

clearUserSessions();
