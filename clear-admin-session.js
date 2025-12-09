import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'queue_management'
};

async function clearAdminSessions() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');
    
    // Clear all admin sessions
    const [result] = await connection.query('DELETE FROM admin_sessions');
    console.log(`🗑️ Cleared ${result.affectedRows} admin session(s)`);
    
    // Clear all user sessions
    const [userResult] = await connection.query('DELETE FROM user_sessions');
    console.log(`🗑️ Cleared ${userResult.affectedRows} user session(s)`);
    
    console.log('\n✅ All sessions cleared! Please login again.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
    process.exit(0);
  }
}

clearAdminSessions();
