import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  let connection;
  
  try {
    console.log('🔌 Connecting to database...');
    connection = await pool.getConnection();
    console.log('✅ Connected to database\n');
    
    const migrationsPath = path.join(__dirname, 'migrations');
    
    // Check if migrations directory exists
    if (!fs.existsSync(migrationsPath)) {
      console.log('❌ Migrations directory not found');
      return;
    }
    
    // Read all SQL files from migrations directory
    const files = fs.readdirSync(migrationsPath)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Run in alphabetical order
    
    if (files.length === 0) {
      console.log('⚠️ No migration files found');
      return;
    }
    
    console.log(`📁 Found ${files.length} migration file(s):\n`);
    
    for (const file of files) {
      console.log(`🔄 Running migration: ${file}`);
      const filePath = path.join(migrationsPath, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      try {
        await connection.query(sql);
        console.log(`✅ Successfully executed: ${file}\n`);
      } catch (error) {
        // Check if error is about column already existing
        if (error.code === 'ER_DUP_FIELDNAME') {
          console.log(`⚠️ ${file}: Columns already exist (skipped)\n`);
        } else {
          console.error(`❌ Error in ${file}:`, error.message);
          throw error;
        }
      }
    }
    
    console.log('🎉 All migrations completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    if (connection) {
      connection.release();
      console.log('\n🔌 Database connection released');
    }
    // Close the pool
    await pool.end();
  }
}

// Run migrations
runMigrations();
