-- Add admin_id column to settings table (voice/TTS configuration)
-- This allows each admin to have their own voice configuration settings

-- Add admin_id column if it doesn't exist
ALTER TABLE settings 
ADD COLUMN IF NOT EXISTS admin_id INT DEFAULT NULL AFTER id;

-- Add foreign key constraint
ALTER TABLE settings
ADD CONSTRAINT fk_settings_admin
FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_settings_admin_id ON settings(admin_id);

-- Migration completed
SELECT 'Settings table updated with admin_id column' AS status;
