import pool from './config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  let connection;
  try {
    connection = await pool.getConnection();
    
    console.log('🚀 Starting session limits migration...\n');
    
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, 'migrations', 'add_session_limits_to_licenses.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Split by semicolons and execute each statement
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log('Executing:', statement.substring(0, 100) + '...');
        await connection.query(statement);
        console.log('✅ Success\n');
      }
    }
    
    // Verify the changes
    console.log('📋 Verifying changes...');
    const [columns] = await connection.query(`
      SHOW COLUMNS FROM licenses 
      WHERE Field IN ('max_receptionists', 'max_ticket_info_users', 'max_sessions_per_receptionist', 'max_sessions_per_ticket_info')
    `);
    
    console.log('\n✅ Migration completed successfully!');
    console.log('\n📊 New columns added:');
    columns.forEach(col => {
      console.log(`   - ${col.Field}: ${col.Type} (Default: ${col.Default})`);
    });
    
    // Show sample data
    const [licenses] = await connection.query(`
      SELECT id, company_name, max_receptionists, max_ticket_info_users, 
             max_sessions_per_receptionist, max_sessions_per_ticket_info 
      FROM licenses 
      LIMIT 3
    `);
    
    if (licenses.length > 0) {
      console.log('\n📦 Sample license data:');
      licenses.forEach(lic => {
        console.log(`   License ID ${lic.id} (${lic.company_name}):`);
        console.log(`      - Max Receptionists: ${lic.max_receptionists}`);
        console.log(`      - Max Ticket Info Users: ${lic.max_ticket_info_users}`);
        console.log(`      - Sessions/Receptionist: ${lic.max_sessions_per_receptionist}`);
        console.log(`      - Sessions/Ticket Info: ${lic.max_sessions_per_ticket_info}`);
      });
    }
    
    console.log('\n✨ All done! You can now create licenses with session limits.');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    if (connection) {
      connection.release();
    }
    await pool.end();
  }
}

// Run the migration
runMigration();
