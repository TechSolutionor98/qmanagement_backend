import axios from 'axios';
import jwt from 'jsonwebtoken';

async function debugToken() {
  try {
    // Login
    const loginRes = await axios.post('http://localhost:5000/api/auth/ticket-info/login', {
      username: 'ssssss',
      password: 'ssssss'
    });
    
    const token = loginRes.data.token;
    const user = loginRes.data.user;
    
    console.log('📥 Login Response User Object:');
    console.log(JSON.stringify(user, null, 2));
    
    // Decode JWT token
    const decoded = jwt.decode(token);
    console.log('\n🔓 Decoded JWT Token:');
    console.log(JSON.stringify(decoded, null, 2));
    
    console.log('\n🔍 Key Fields:');
    console.log('  Response user.admin_id:', user.admin_id);
    console.log('  Token decoded.admin_id:', decoded.admin_id);
    console.log('  Token decoded.role:', decoded.role);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

debugToken();
