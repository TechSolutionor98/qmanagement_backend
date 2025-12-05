import pool from './config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupDatabase() {
  let connection;
  
  try {
    console.log('🔍 Testing database connection...');
    
    // Use the existing pool from config
    connection = await pool.getConnection();
    console.log('✅ Connected to database using existing pool configuration');
    
    // Check if voice_settings table exists
    const [tables] = await connection.query("SHOW TABLES LIKE 'voice_settings'");
    
    if (tables.length > 0) {
      console.log('ℹ️ voice_settings table already exists!');
      const [columns] = await connection.query('DESCRIBE voice_settings');
      console.log('📊 Table structure:');
      console.table(columns);
      return;
    }
    
    console.log('📝 Creating voice_settings table...');
    
    // Read and execute SQL file
    const sqlFile = path.join(__dirname, 'database', 'create-voice-settings-table.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = sql.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        await connection.query(statement);
        console.log('✅ Executed statement');
      }
    }
    
    console.log('✅ voice_settings table created successfully!');
    
    // Verify table
    const [newTables] = await connection.query("SHOW TABLES LIKE 'voice_settings'");
    if (newTables.length > 0) {
      console.log('✅ Table verification successful!');
      const [columns] = await connection.query('DESCRIBE voice_settings');
      console.log('📊 Table structure:');
      console.table(columns);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    if (connection) {
      connection.release();
      console.log('🔌 Database connection released');
    }
  }
}

setupDatabase()
  .then(() => {
    console.log('\n✅ Setup complete! You can now restart your backend server.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  });
