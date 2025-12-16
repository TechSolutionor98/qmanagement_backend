import pool from './config/database.js';

async function checkDatabase() {
  try {
    console.log('🔍 Checking database schema...\n');

    // Check user_sessions table structure
    const [userSessionsColumns] = await pool.query('DESCRIBE user_sessions');
    console.log('user_sessions table columns:');
    console.log(JSON.stringify(userSessionsColumns, null, 2));

    console.log('\n---\n');

    // Check users table structure
    const [usersColumns] = await pool.query('DESCRIBE users');
    console.log('users table columns:');
    console.log(JSON.stringify(usersColumns, null, 2));

    console.log('\n---\n');

    // Check existing user sessions
    const [sessions] = await pool.query('SELECT * FROM user_sessions LIMIT 5');
    console.log('Current user sessions:');
    console.log(JSON.stringify(sessions, null, 2));

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    process.exit(0);
  }
}

checkDatabase();
