-- Add admin_id column to users table
ALTER TABLE users ADD COLUMN admin_id INT NULL AFTER id;

-- Add foreign key constraint
ALTER TABLE users ADD CONSTRAINT fk_users_admin FOREIGN KEY (admin_id) REFERENCES admin(id) ON DELETE CASCADE;

-- Update existing users to assign them to admin with id=2 (default admin)
UPDATE users SET admin_id = 2 WHERE admin_id IS NULL;
