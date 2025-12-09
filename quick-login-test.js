import axios from 'axios';

async function quickTest() {
  try {
    const res = await axios.post('http://localhost:5000/api/auth/ticket-info/login', {
      username: 'ssssss',
      password: 'ssssss'
    }, { validateStatus: () => true });
    
    console.log('Status:', res.status);
    console.log('Success:', res.data.success);
    if (res.data.user) console.log('User:', res.data.user.username, '-', res.data.user.role);
    if (!res.data.success) console.log('Error:', res.data.message);
    process.exit(0);
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
}

quickTest();
