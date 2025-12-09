import axios from 'axios';

(async () => {
  try {
    // Clear sessions first
    await axios.post('http://localhost:5000/api/auth/ticket-info/login', {
      username: 'temp',
      password: 'temp'
    }).catch(() => {}); // Ignore error
    
    // Real login
    const res = await axios.post('http://localhost:5000/api/auth/ticket-info/login', {
      username: 'ssssss',
      password: 'ssssss'
    });
    
    const token = res.data.token;
    const parts = token.split('.');
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    
    console.log('Token Payload:', JSON.stringify(payload, null, 2));
    console.log('\n✅ admin_id:', payload.admin_id);
    console.log('✅ role:', payload.role);
    
  } catch (e) {
    console.error('Error:', e.response?.data || e.message);
  }
  process.exit(0);
})();
