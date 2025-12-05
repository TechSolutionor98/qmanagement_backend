import pool from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createVoiceSettingsTable() {
  try {
    console.log('Creating voice_settings table...');
    
    // Read SQL file
    const sqlFile = path.join(__dirname, 'create-voice-settings-table.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = sql.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        await pool.query(statement);
      }
    }
    
    console.log('✅ voice_settings table created successfully!');
    
    // Verify table exists
    const [tables] = await pool.query("SHOW TABLES LIKE 'voice_settings'");
    if (tables.length > 0) {
      console.log('✅ Table verification successful!');
      
      // Show table structure
      const [columns] = await pool.query('DESCRIBE voice_settings');
      console.log('📊 Table structure:');
      console.table(columns);
    }
    
  } catch (error) {
    console.error('❌ Error creating voice_settings table:', error.message);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createVoiceSettingsTable()
    .then(() => {
      console.log('✅ Setup complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Setup failed:', error);
      process.exit(1);
    });
}

export default createVoiceSettingsTable;
