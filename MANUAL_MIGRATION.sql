-- ==============================================
-- MIGRATION: Add admin_id to Configuration & Counter Display Tables
-- Run these queries in your MySQL database
-- ==============================================

-- Step 1: Add admin_id to counter_display_config table
-- ---------------------------------------------
ALTER TABLE counter_display_config 
ADD COLUMN admin_id INT DEFAULT NULL AFTER id;

ALTER TABLE counter_display_config
ADD CONSTRAINT fk_counter_display_admin
FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE;

CREATE INDEX idx_counter_display_admin_id ON counter_display_config(admin_id);

-- Step 2: Add admin_id to slider_images table
-- ---------------------------------------------
ALTER TABLE slider_images 
ADD COLUMN admin_id INT DEFAULT NULL AFTER id;

ALTER TABLE slider_images
ADD CONSTRAINT fk_slider_images_admin
FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE;

CREATE INDEX idx_slider_images_admin_id ON slider_images(admin_id);

-- Step 3: Add admin_id to settings table (voice/TTS configuration)
-- ---------------------------------------------
ALTER TABLE settings 
ADD COLUMN admin_id INT DEFAULT NULL AFTER id;

ALTER TABLE settings
ADD CONSTRAINT fk_settings_admin
FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE;

CREATE INDEX idx_settings_admin_id ON settings(admin_id);

-- ==============================================
-- VERIFICATION QUERIES
-- ==============================================

-- Check if columns were added successfully:
DESCRIBE counter_display_config;
DESCRIBE slider_images;
DESCRIBE settings;

-- View data with admin_id:
SELECT id, admin_id, content_type, screen_type FROM counter_display_config;
SELECT id, admin_id, image_name FROM slider_images LIMIT 5;
SELECT id, admin_id, voice_type FROM settings;

-- ==============================================
-- MIGRATION COMPLETED
-- ==============================================
SELECT '✅ Migration completed successfully!' AS status;
