import pool from './config/database.js';

async function cleanupInvalidAdminIds() {
  try {
    console.log('🧹 Cleaning up invalid admin_id references...\n');

    // Get valid admin IDs
    const [validAdmins] = await pool.query('SELECT id FROM admin');
    const validIds = validAdmins.map(a => a.id);
    console.log('✅ Valid admin IDs in system:', validIds);

    // Check counter_display_config
    console.log('\n📋 Checking counter_display_config...');
    const [counterConfigs] = await pool.query('SELECT id, admin_id FROM counter_display_config');
    console.table(counterConfigs);
    
    const invalidCounterConfigs = counterConfigs.filter(c => c.admin_id && !validIds.includes(c.admin_id));
    
    if (invalidCounterConfigs.length > 0) {
      console.log('\n⚠️  Found invalid admin_id records in counter_display_config:', invalidCounterConfigs.length);
      console.log('Options:');
      console.log('1. Delete these records (recommended if they are old/test data)');
      console.log('2. Update to valid admin ID (if you want to keep the data)');
      console.log('3. Set admin_id to NULL (temporary fix)');
      
      // For now, let's delete invalid records
      for (const config of invalidCounterConfigs) {
        console.log(`\n  Deleting counter_display_config record ${config.id} with invalid admin_id: ${config.admin_id}`);
        await pool.query('DELETE FROM counter_display_config WHERE id = ?', [config.id]);
      }
      console.log('\n  ✅ Deleted invalid records from counter_display_config');
    } else {
      console.log('  ✅ All counter_display_config records have valid admin_ids');
    }

    // Check slider_images
    console.log('\n📋 Checking slider_images...');
    const [sliderImages] = await pool.query('SELECT id, admin_id, image_name FROM slider_images');
    console.table(sliderImages);
    
    const invalidSliderImages = sliderImages.filter(s => s.admin_id && !validIds.includes(s.admin_id));
    
    if (invalidSliderImages.length > 0) {
      console.log('\n⚠️  Found invalid admin_id records in slider_images:', invalidSliderImages.length);
      
      for (const image of invalidSliderImages) {
        console.log(`\n  Deleting slider_image record ${image.id} (${image.image_name}) with invalid admin_id: ${image.admin_id}`);
        await pool.query('DELETE FROM slider_images WHERE id = ?', [image.id]);
      }
      console.log('\n  ✅ Deleted invalid records from slider_images');
    } else {
      console.log('  ✅ All slider_images records have valid admin_ids');
    }

    // Check voice_settings
    console.log('\n📋 Checking voice_settings...');
    const [voiceSettings] = await pool.query('SELECT id, admin_id, voice_type, language FROM voice_settings');
    console.table(voiceSettings);
    
    const invalidVoiceSettings = voiceSettings.filter(v => v.admin_id && !validIds.includes(v.admin_id));
    
    if (invalidVoiceSettings.length > 0) {
      console.log('\n⚠️  Found invalid admin_id records in voice_settings:', invalidVoiceSettings.length);
      console.log('⚠️  Note: admin_id = 1 is super_admin, keeping it as it might be default settings');
      
      // Only delete if admin_id is not 1 (super_admin might have settings)
      const toDelete = invalidVoiceSettings.filter(v => v.admin_id !== 1);
      
      for (const setting of toDelete) {
        console.log(`\n  Deleting voice_setting record ${setting.id} with invalid admin_id: ${setting.admin_id}`);
        await pool.query('DELETE FROM voice_settings WHERE id = ?', [setting.id]);
      }
      
      if (toDelete.length > 0) {
        console.log('\n  ✅ Deleted invalid records from voice_settings');
      }
    } else {
      console.log('  ✅ All voice_settings records have valid admin_ids');
    }

    console.log('\n\n✅ Cleanup complete!');
    console.log('📊 Summary:');
    console.log(`   Valid admin IDs in system: ${validIds.join(', ')}`);
    console.log('   All tables cleaned up and ready for use');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error during cleanup:', error.message);
    console.error(error);
    process.exit(1);
  }
}

cleanupInvalidAdminIds();
