import pool from "./config/database.js";

async function checkDeviceInfo() {
  try {
    console.log('🔍 Checking device info in sessions...\n');
    
    const [sessions] = await pool.query(`
      SELECT 
        session_id,
        username,
        device_info,
        device_id,
        ip_address,
        active
      FROM user_sessions 
      WHERE active = 1
      LIMIT 5
    `);
    
    console.log('📱 Active Sessions with Device Info:');
    console.table(sessions);
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkDeviceInfo();
