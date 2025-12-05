import pool from '../config/database.js';

async function addLanguagesColumn() {
  try {
    console.log('🔧 Adding languages column to voice_settings table...');
    
    // Check if column already exists
    const [columns] = await pool.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'voice_settings' 
      AND COLUMN_NAME = 'languages'
    `);
    
    if (columns.length > 0) {
      console.log('✅ Column "languages" already exists in voice_settings table');
      process.exit(0);
    }
    
    // Add languages column
    await pool.query(`
      ALTER TABLE voice_settings
      ADD COLUMN languages TEXT NULL COMMENT 'JSON array of selected languages (max 2)'
      AFTER language
    `);
    
    console.log('✅ Column "languages" added successfully to voice_settings table');
    
    // Migrate existing data
    console.log('🔄 Migrating existing language data...');
    await pool.query(`
      UPDATE voice_settings
      SET languages = JSON_ARRAY(language)
      WHERE languages IS NULL AND language IS NOT NULL
    `);
    
    console.log('✅ Existing data migrated successfully');
    console.log('✅ Database schema updated - voice_settings now supports multiple languages');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding languages column:', error);
    process.exit(1);
  }
}

addLanguagesColumn();
