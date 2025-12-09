import axios from 'axios';

async function testTicketInfoAPIs() {
  try {
    console.log('🧪 Testing ticket_info APIs...\n');
    
    // Step 1: Login
    console.log('1️⃣ Logging in as ticket_info user...');
    const loginRes = await axios.post('http://localhost:5000/api/auth/ticket-info/login', {
      username: 'ssssss',
      password: 'ssssss'
    }, { validateStatus: () => true });
    
    if (loginRes.status !== 200) {
      console.error('❌ Login failed:', loginRes.status, loginRes.data);
      process.exit(1);
    }
    
    const token = loginRes.data.token;
    const user = loginRes.data.user;
    console.log('✅ Login successful');
    console.log('   User:', user.username);
    console.log('   Role:', user.role);
    console.log('   Admin ID:', user.admin_id);
    
    // Step 2: Get Counter Display Config
    console.log('\n2️⃣ Fetching counter display config...');
    const displayRes = await axios.get('http://localhost:5000/api/counter-display/config', {
      headers: { 'Authorization': `Bearer ${token}` },
      validateStatus: () => true
    });
    
    if (displayRes.status !== 200) {
      console.error('❌ Display config failed:', displayRes.status, displayRes.data);
    } else {
      console.log('✅ Display config fetched');
      const config = displayRes.data.config;
      console.log('   Content Type:', config.content_type);
      console.log('   Ticker:', config.ticker_content?.substring(0, 50) + '...');
      console.log('   Left Logo:', config.left_logo_url ? 'Yes' : 'No');
      console.log('   Right Logo:', config.right_logo_url ? 'Yes' : 'No');
      console.log('   Video URL:', config.video_url ? 'Yes' : 'No');
    }
    
    // Step 3: Get Voice Settings
    console.log('\n3️⃣ Fetching voice settings...');
    const voiceRes = await axios.get('http://localhost:5000/api/voices/settings', {
      headers: { 'Authorization': `Bearer ${token}` },
      validateStatus: () => true
    });
    
    if (voiceRes.status !== 200) {
      console.error('❌ Voice settings failed:', voiceRes.status, voiceRes.data);
    } else {
      console.log('✅ Voice settings fetched');
      const settings = voiceRes.data.settings;
      console.log('   Voice Type:', settings.voice_type);
      console.log('   Languages:', settings.languages);
      console.log('   Speech Rate:', settings.speech_rate);
      console.log('   Speech Pitch:', settings.speech_pitch);
    }
    
    console.log('\n🎉 All tests passed!');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.status, error.response.data);
    }
    process.exit(1);
  }
}

testTicketInfoAPIs();
