import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function checkVoiceSettings() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'que_management'
  });

  try {
    // Check if voice_settings table exists
    const [tables] = await connection.query(
      "SHOW TABLES LIKE 'voice_settings'"
    );
    
    if (tables.length === 0) {
      console.log('❌ voice_settings table DOES NOT EXIST!');
      console.log('\n🔧 Creating voice_settings table...\n');
      
      // Create the table
      await connection.query(`
        CREATE TABLE IF NOT EXISTS voice_settings (
          id INT AUTO_INCREMENT PRIMARY KEY,
          admin_id INT NOT NULL,
          voice_type VARCHAR(50) DEFAULT 'default',
          language VARCHAR(10) DEFAULT 'en',
          languages TEXT,
          speech_rate DECIMAL(3,2) DEFAULT 0.90,
          speech_pitch DECIMAL(3,2) DEFAULT 1.00,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (admin_id) REFERENCES admin(id) ON DELETE CASCADE
        )
      `);
      
      console.log('✅ voice_settings table created successfully!');
    } else {
      console.log('✅ voice_settings table EXISTS');
    }
    
    // Show table structure
    const [columns] = await connection.query('DESCRIBE voice_settings');
    console.log('\n📋 voice_settings Table Schema:');
    console.log(JSON.stringify(columns, null, 2));
    
    // Show all settings
    const [settings] = await connection.query('SELECT * FROM voice_settings');
    console.log('\n📊 Current voice_settings Data:');
    console.log(JSON.stringify(settings, null, 2));
    
    if (settings.length === 0) {
      console.log('\n⚠️ No voice settings found in database');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkVoiceSettings();
