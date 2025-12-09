import pool from './config/database.js';
import bcryptjs from 'bcryptjs';

async function checkPassword() {
  try {
    console.log('🔍 Checking user password...\n');
    
    const [users] = await pool.query(
      "SELECT id, username, email, password, role FROM users WHERE username = 'ssssss'"
    );
    
    if (users.length === 0) {
      console.log('❌ User not found!');
      process.exit(1);
    }
    
    const user = users[0];
    console.log('User found:', { id: user.id, username: user.username, role: user.role });
    console.log('Password hash:', user.password);
    console.log('Hash length:', user.password.length);
    
    // Test with different passwords
    const testPasswords = ['ssssss', '123456', 'password'];
    
    console.log('\n🔐 Testing passwords:');
    for (const pwd of testPasswords) {
      const match = await bcryptjs.compare(pwd, user.password);
      console.log(`  "${pwd}": ${match ? '✅ MATCH' : '❌ NO MATCH'}`);
    }
    
    // Generate new hash for 'ssssss'
    console.log('\n🔑 Generating new hash for "ssssss":');
    const newHash = await bcryptjs.hash('ssssss', 10);
    console.log('New hash:', newHash);
    
    const testNewHash = await bcryptjs.compare('ssssss', newHash);
    console.log('New hash verification:', testNewHash ? '✅ WORKS' : '❌ FAILED');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkPassword();
