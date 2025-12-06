import pool from './config/database.js';

async function fixForeignKeys() {
  try {
    console.log('🔧 Fixing foreign key constraints...\n');

    // Drop existing foreign keys
    console.log('1️⃣ Dropping old foreign keys from counter_display_config...');
    try {
      await pool.query('ALTER TABLE counter_display_config DROP FOREIGN KEY fk_counter_display_admin');
      console.log('   ✅ Dropped fk_counter_display_admin');
    } catch (err) {
      if (err.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
        console.log('   ⚠️  Foreign key already dropped or does not exist');
      } else {
        throw err;
      }
    }

    console.log('\n2️⃣ Dropping old foreign keys from slider_images...');
    try {
      await pool.query('ALTER TABLE slider_images DROP FOREIGN KEY fk_slider_images_admin');
      console.log('   ✅ Dropped fk_slider_images_admin');
    } catch (err) {
      if (err.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
        console.log('   ⚠️  Foreign key already dropped or does not exist');
      } else {
        throw err;
      }
    }

    // Add new foreign keys pointing to admin table
    console.log('\n3️⃣ Adding foreign key to counter_display_config pointing to admin table...');
    await pool.query(`
      ALTER TABLE counter_display_config 
      ADD CONSTRAINT fk_counter_display_admin 
      FOREIGN KEY (admin_id) REFERENCES admin(id) 
      ON DELETE CASCADE
    `);
    console.log('   ✅ Foreign key added');

    console.log('\n4️⃣ Adding foreign key to slider_images pointing to admin table...');
    await pool.query(`
      ALTER TABLE slider_images 
      ADD CONSTRAINT fk_slider_images_admin 
      FOREIGN KEY (admin_id) REFERENCES admin(id) 
      ON DELETE CASCADE
    `);
    console.log('   ✅ Foreign key added');

    console.log('\n✅ All foreign keys fixed successfully!');
    console.log('   counter_display_config.admin_id → admin.id');
    console.log('   slider_images.admin_id → admin.id');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

fixForeignKeys();
