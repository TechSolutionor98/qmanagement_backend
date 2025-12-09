import pool from './config/database.js';

async function checkAdminSettings() {
  try {
    console.log('🔍 Checking admin_id 8 settings...\n');
    
    // Voice settings
    const [voiceSettings] = await pool.query(
      'SELECT * FROM voice_settings WHERE admin_id = 8 ORDER BY updated_at DESC LIMIT 1'
    );
    
    console.log('🎤 Voice Settings (admin_id 8):');
    if (voiceSettings.length > 0) {
      console.table(voiceSettings);
    } else {
      console.log('❌ No voice settings found for admin_id 8');
    }
    
    // Counter display config
    const [displayConfig] = await pool.query(
      'SELECT * FROM counter_display_config WHERE admin_id = 8 LIMIT 1'
    );
    
    console.log('\n📺 Counter Display Config (admin_id 8):');
    if (displayConfig.length > 0) {
      console.table(displayConfig);
    } else {
      console.log('❌ No display config found for admin_id 8');
    }
    
    // Check if admin_id 9 has settings
    const [voice9] = await pool.query(
      'SELECT id, admin_id, voice_type, languages FROM voice_settings WHERE admin_id = 9'
    );
    console.log('\n🔍 Admin_id 9 voice settings:', voice9.length > 0 ? 'EXISTS' : 'NOT FOUND');
    
    const [display1] = await pool.query(
      'SELECT id, admin_id, content_type, ticker_content FROM counter_display_config WHERE admin_id = 1'
    );
    console.log('🔍 Admin_id 1 display config:', display1.length > 0 ? 'EXISTS' : 'NOT FOUND');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkAdminSettings();
