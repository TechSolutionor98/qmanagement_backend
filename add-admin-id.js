import pool from './config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function addAdminIdColumns() {
  const connection = await pool.getConnection();
  
  try {
    console.log('🔌 Connected to database');
    console.log('📝 Adding admin_id columns...\n');
    
    // 1. Add admin_id to counter_display_config
    try {
      console.log('1️⃣ Adding admin_id to counter_display_config...');
      await connection.query(`
        ALTER TABLE counter_display_config 
        ADD COLUMN IF NOT EXISTS admin_id INT DEFAULT NULL AFTER id
      `);
      console.log('✅ Column added to counter_display_config\n');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠️ Column already exists in counter_display_config\n');
      } else {
        throw error;
      }
    }
    
    // 2. Add admin_id to slider_images
    try {
      console.log('2️⃣ Adding admin_id to slider_images...');
      await connection.query(`
        ALTER TABLE slider_images 
        ADD COLUMN IF NOT EXISTS admin_id INT DEFAULT NULL AFTER id
      `);
      console.log('✅ Column added to slider_images\n');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠️ Column already exists in slider_images\n');
      } else {
        throw error;
      }
    }
    
    // 3. Add admin_id to settings
    try {
      console.log('3️⃣ Adding admin_id to settings...');
      await connection.query(`
        ALTER TABLE settings 
        ADD COLUMN IF NOT EXISTS admin_id INT DEFAULT NULL AFTER id
      `);
      console.log('✅ Column added to settings\n');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠️ Column already exists in settings\n');
      } else if (error.code === 'ER_NO_SUCH_TABLE') {
        console.log('⚠️ Settings table does not exist (will be created when needed)\n');
      } else {
        throw error;
      }
    }
    
    // 4. Add foreign key for counter_display_config (if not exists)
    try {
      console.log('4️⃣ Adding foreign key to counter_display_config...');
      await connection.query(`
        ALTER TABLE counter_display_config
        ADD CONSTRAINT fk_counter_display_admin
        FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
      `);
      console.log('✅ Foreign key added to counter_display_config\n');
    } catch (error) {
      if (error.code === 'ER_DUP_KEYNAME') {
        console.log('⚠️ Foreign key already exists in counter_display_config\n');
      } else {
        console.log('⚠️ Could not add foreign key to counter_display_config:', error.message, '\n');
      }
    }
    
    // 5. Add foreign key for slider_images
    try {
      console.log('5️⃣ Adding foreign key to slider_images...');
      await connection.query(`
        ALTER TABLE slider_images
        ADD CONSTRAINT fk_slider_images_admin
        FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
      `);
      console.log('✅ Foreign key added to slider_images\n');
    } catch (error) {
      if (error.code === 'ER_DUP_KEYNAME') {
        console.log('⚠️ Foreign key already exists in slider_images\n');
      } else {
        console.log('⚠️ Could not add foreign key to slider_images:', error.message, '\n');
      }
    }
    
    // 6. Add foreign key for settings
    try {
      console.log('6️⃣ Adding foreign key to settings...');
      await connection.query(`
        ALTER TABLE settings
        ADD CONSTRAINT fk_settings_admin
        FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
      `);
      console.log('✅ Foreign key added to settings\n');
    } catch (error) {
      if (error.code === 'ER_DUP_KEYNAME') {
        console.log('⚠️ Foreign key already exists in settings\n');
      } else if (error.code === 'ER_NO_SUCH_TABLE') {
        console.log('⚠️ Settings table does not exist (skipping foreign key)\n');
      } else {
        console.log('⚠️ Could not add foreign key to settings:', error.message, '\n');
      }
    }
    
    // 7. Add indexes
    try {
      console.log('7️⃣ Adding indexes...');
      await connection.query(`CREATE INDEX IF NOT EXISTS idx_counter_display_admin_id ON counter_display_config(admin_id)`);
      await connection.query(`CREATE INDEX IF NOT EXISTS idx_slider_images_admin_id ON slider_images(admin_id)`);
      try {
        await connection.query(`CREATE INDEX IF NOT EXISTS idx_settings_admin_id ON settings(admin_id)`);
      } catch (err) {
        if (err.code !== 'ER_NO_SUCH_TABLE') throw err;
      }
      console.log('✅ Indexes added\n');
    } catch (error) {
      console.log('⚠️ Some indexes may already exist\n');
    }
    
    console.log('🎉 Migration completed successfully!');
    console.log('\n📊 Verification:');
    
    // Verify columns were added
    const [counterCols] = await connection.query('SHOW COLUMNS FROM counter_display_config');
    const [sliderCols] = await connection.query('SHOW COLUMNS FROM slider_images');
    
    console.log('\n✅ counter_display_config columns:', counterCols.map(c => c.Field).join(', '));
    console.log('✅ slider_images columns:', sliderCols.map(c => c.Field).join(', '));
    
    // Try to show settings columns if table exists
    try {
      const [settingsCols] = await connection.query('SHOW COLUMNS FROM settings');
      console.log('✅ settings columns:', settingsCols.map(c => c.Field).join(', '));
    } catch (err) {
      if (err.code === 'ER_NO_SUCH_TABLE') {
        console.log('⚠️ settings table does not exist yet');
      }
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    connection.release();
    await pool.end();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the migration
console.log('🚀 Starting migration...\n');
addAdminIdColumns()
  .then(() => {
    console.log('\n✅ All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  });
