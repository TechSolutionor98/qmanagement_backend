-- Add admin_id column to counter_display_config table
-- This allows each admin to have their own counter display configuration

-- Add admin_id column if it doesn't exist
ALTER TABLE counter_display_config 
ADD COLUMN IF NOT EXISTS admin_id INT DEFAULT NULL AFTER id;

-- Add foreign key constraint
ALTER TABLE counter_display_config
ADD CONSTRAINT fk_counter_display_admin
FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_counter_display_admin_id ON counter_display_config(admin_id);

-- Add admin_id column to slider_images table
ALTER TABLE slider_images 
ADD COLUMN IF NOT EXISTS admin_id INT DEFAULT NULL AFTER id;

-- Add foreign key constraint for slider_images
ALTER TABLE slider_images
ADD CONSTRAINT fk_slider_images_admin
FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE;

-- Add index for slider_images
CREATE INDEX IF NOT EXISTS idx_slider_images_admin_id ON slider_images(admin_id);

-- Migration completed
SELECT 'Counter Display tables updated with admin_id columns' AS status;
