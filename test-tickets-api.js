import axios from 'axios';
import pool from './config/database.js';

const API_URL = 'http://localhost:5000/api';

async function testTicketsAPI() {
  try {
    console.log('🔍 Testing Tickets API...\n');

    // First, let's check active user sessions
    console.log('📋 Checking active user sessions...');
    const [sessions] = await pool.query(
      'SELECT * FROM user_sessions WHERE active = 1 ORDER BY login_time DESC LIMIT 5'
    );
    console.log('Active sessions:', sessions);

    if (sessions.length === 0) {
      console.log('❌ No active sessions found!');
      process.exit(1);
    }

    const session = sessions[0];
    const token = session.token;

    console.log('\n🎫 Using token from session:', {
      user_id: session.user_id,
      username: session.username,
      expires_at: session.expires_at
    });

    // Test the API call
    console.log('\n📤 Calling GET /api/tickets?userId=2&today=true');
    try {
      const response = await axios.get(`${API_URL}/tickets?userId=2&today=true`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Success:', response.data);
    } catch (error) {
      console.log('❌ Error:', error.response?.status, error.response?.data);
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    process.exit(0);
  }
}

testTicketsAPI();
