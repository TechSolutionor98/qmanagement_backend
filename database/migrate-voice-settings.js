import pool from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrateVoiceSettings() {
  let connection;
  
  try {
    console.log('🔧 Migrating voice_settings table...');
    
    connection = await pool.getConnection();
    
    // Check if table exists
    const [tables] = await connection.query("SHOW TABLES LIKE 'voice_settings'");
    
    if (tables.length > 0) {
      console.log('📋 Checking current table structure...');
      const [columns] = await connection.query('DESCRIBE voice_settings');
      
      // Check if it has the old structure (setting_name, voice_id)
      const columnNames = columns.map(col => col.Field);
      const hasOldStructure = columnNames.includes('setting_name') && columnNames.includes('voice_id');
      const hasNewStructure = columnNames.includes('admin_id') && columnNames.includes('voice_type');
      
      if (hasNewStructure) {
        console.log('✅ Table already has the correct structure!');
        console.table(columns);
        return;
      }
      
      if (hasOldStructure) {
        console.log('⚠️ Old voice_settings table structure detected. Backing up and recreating...');
        
        // Backup old data (optional)
        try {
          await connection.query('RENAME TABLE voice_settings TO voice_settings_old_backup');
          console.log('✅ Old table backed up as voice_settings_old_backup');
        } catch (err) {
          console.log('ℹ️ Could not backup table, proceeding with drop...');
          await connection.query('DROP TABLE IF EXISTS voice_settings');
          console.log('✅ Old table dropped');
        }
      }
    }
    
    // Create new table with correct structure
    console.log('📝 Creating voice_settings table with new structure...');
    
    const sqlFile = path.join(__dirname, 'create-voice-settings-table.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = sql.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        await connection.query(statement);
        console.log('✅ Executed statement');
      }
    }
    
    console.log('✅ voice_settings table created successfully with new structure!');
    
    // Verify new structure
    const [newColumns] = await connection.query('DESCRIBE voice_settings');
    console.log('📊 New table structure:');
    console.table(newColumns);
    
    // Check for default settings
    const [defaultSettings] = await connection.query('SELECT * FROM voice_settings WHERE admin_id = 1');
    if (defaultSettings.length > 0) {
      console.log('✅ Default settings found:');
      console.table(defaultSettings);
    } else {
      console.log('ℹ️ No default settings found. They will be created on first use.');
    }
    
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    throw error;
  } finally {
    if (connection) {
      connection.release();
      console.log('🔌 Database connection released');
    }
  }
}

migrateVoiceSettings()
  .then(() => {
    console.log('\n✅ Migration complete! Please restart your backend server.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  });
