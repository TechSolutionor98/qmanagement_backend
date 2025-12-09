import pool from "./config/database.js";
import bcryptjs from "bcryptjs";

async function testTicketInfoLogin() {
  try {
    console.log('🔍 Testing ticket_info login...\n');
    
    const username = 'ssssss'; // Change this to your test username
    const password = 'ssssss'; // Change this to your test password
    
    // Check if user exists
    const [users] = await pool.query(
      "SELECT * FROM users WHERE (email = ? OR username = ?) AND role = 'ticket_info'", 
      [username, username]
    );
    
    if (users.length === 0) {
      console.log('❌ No ticket_info user found with username:', username);
      await pool.end();
      process.exit(1);
    }
    
    const user = users[0];
    console.log('✅ User found:');
    console.table({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
      admin_id: user.admin_id
    });
    
    // Check password
    const passwordMatch = await bcryptjs.compare(password, user.password);
    
    if (passwordMatch) {
      console.log('\n✅ Password matches!');
      console.log('✅ Login should work properly');
    } else {
      console.log('\n❌ Password does NOT match!');
      console.log('💡 Try resetting the password or use correct credentials');
    }
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testTicketInfoLogin();
