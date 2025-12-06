import pool from './config/database.js';

async function fixVoiceSettingsForeignKey() {
  try {
    console.log('🔧 Fixing voice_settings foreign key...\n');

    // Check current foreign keys
    console.log('1️⃣ Checking current foreign keys on voice_settings...');
    const [fks] = await pool.query(`
      SELECT CONSTRAINT_NAME, REFERENCED_TABLE_NAME 
      FROM information_schema.KEY_COLUMN_USAGE 
      WHERE TABLE_SCHEMA = 'u998585094_qmanagementest' 
      AND TABLE_NAME = 'voice_settings' 
      AND REFERENCED_TABLE_NAME IS NOT NULL
    `);
    
    console.table(fks);

    // Drop existing foreign key if exists
    if (fks.length > 0) {
      for (const fk of fks) {
        console.log(`\n2️⃣ Dropping foreign key: ${fk.CONSTRAINT_NAME}...`);
        try {
          await pool.query(`ALTER TABLE voice_settings DROP FOREIGN KEY ${fk.CONSTRAINT_NAME}`);
          console.log('   ✅ Dropped');
        } catch (err) {
          console.log('   ⚠️  Already dropped or error:', err.message);
        }
      }
    } else {
      console.log('\n2️⃣ No foreign keys found to drop');
    }

    // Add new foreign key pointing to admin table
    console.log('\n3️⃣ Adding foreign key to admin table...');
    await pool.query(`
      ALTER TABLE voice_settings 
      ADD CONSTRAINT fk_voice_settings_admin 
      FOREIGN KEY (admin_id) REFERENCES admin(id) 
      ON DELETE CASCADE
    `);
    console.log('   ✅ Foreign key added: voice_settings.admin_id → admin.id');

    // Show current voice_settings data
    console.log('\n4️⃣ Current voice_settings data:');
    const [settings] = await pool.query('SELECT id, admin_id, voice_type, language FROM voice_settings');
    console.table(settings);

    console.log('\n✅ Voice settings foreign key fixed successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

fixVoiceSettingsForeignKey();
