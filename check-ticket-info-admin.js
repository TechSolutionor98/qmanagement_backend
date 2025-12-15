import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function checkTicketInfoAdmin() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'que_management'
  });

  try {
    console.log('🔍 Checking ticket_info users and their admin_ids...\n');
    
    // Get all ticket_info users
    const [ticketInfoUsers] = await connection.query(
      `SELECT id, username, email, role, admin_id, status 
       FROM users 
       WHERE role = 'ticket_info' 
       ORDER BY id DESC`
    );
    
    console.log('📊 Ticket Info Users:');
    console.log(JSON.stringify(ticketInfoUsers, null, 2));
    
    console.log('\n═══════════════════════════════════════════');
    console.log('Voice Settings by Admin:');
    console.log('═══════════════════════════════════════════\n');
    
    // Get voice settings for each admin
    const [voiceSettings] = await connection.query(
      `SELECT id, admin_id, voice_type, language, languages, speech_rate, speech_pitch 
       FROM voice_settings 
       WHERE is_active = TRUE 
       ORDER BY admin_id`
    );
    
    voiceSettings.forEach(setting => {
      console.log(`Admin ID: ${setting.admin_id}`);
      console.log(`  🎤 Voice Type: ${setting.voice_type}`);
      console.log(`  🌐 Languages: ${setting.languages}`);
      console.log(`  ⚡ Speed: ${setting.speech_rate}`);
      console.log(`  🎵 Pitch: ${setting.speech_pitch}`);
      console.log('');
    });
    
    console.log('═══════════════════════════════════════════');
    console.log('MAPPING:');
    console.log('═══════════════════════════════════════════\n');
    
    ticketInfoUsers.forEach(user => {
      const userSetting = voiceSettings.find(s => s.admin_id === user.admin_id);
      if (userSetting) {
        console.log(`✅ ${user.username} (admin_id: ${user.admin_id})`);
        console.log(`   Will use: ${userSetting.voice_type} voice`);
        console.log(`   Languages: ${userSetting.languages}`);
      } else {
        console.log(`⚠️ ${user.username} (admin_id: ${user.admin_id})`);
        console.log(`   No voice settings found for this admin!`);
      }
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkTicketInfoAdmin();
