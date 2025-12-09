import pool from './config/database.js';

(async () => {
  try {
    // Check ALL user12's sessions (active and inactive)
    const [sessions] = await pool.query(`
      SELECT 
        us.session_id,
        us.user_id, 
        us.counter_no, 
        us.is_active,
        us.active,
        us.created_at,
        u.username
      FROM user_sessions us
      JOIN users u ON us.user_id = u.id
      WHERE u.username = 'user12'
      ORDER BY us.created_at DESC 
      LIMIT 5
    `);
    
    console.log('='.repeat(80));
    console.log('USER12 ALL SESSIONS (Latest 5):');
    console.log('='.repeat(80));
    
    if (sessions.length === 0) {
      console.log('❌ No sessions found for user12!');
    } else {
      sessions.forEach((session, index) => {
        console.log(`\n[${index + 1}] Session ID: ${session.session_id}`);
        console.log(`    User ID: ${session.user_id}`);
        console.log(`    Username: ${session.username}`);
        console.log(`    Counter No: ${session.counter_no === null ? '❌ NULL' : `✅ ${session.counter_no}`}`);
        console.log(`    is_active: ${session.is_active ? '✅ 1' : '❌ 0'}`);
        console.log(`    active: ${session.active ? '✅ 1' : '❌ 0'}`);
        console.log(`    Created At: ${session.created_at}`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();
