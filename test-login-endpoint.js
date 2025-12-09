import axios from 'axios';

async function testLogin() {
  try {
    console.log('🔐 Testing ticket_info login endpoint...\n');
    
    const response = await axios.post('http://localhost:5000/api/auth/ticket-info/login', {
      username: 'ssssss',
      password: 'ssssss'
    }, {
      validateStatus: () => true
    });
    
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

testLogin();
