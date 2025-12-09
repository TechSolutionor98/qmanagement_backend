-- ==============================================
-- PERMANENT FIX: Add all role types to users table
-- Run this if role ENUM is missing 'ticket_info'
-- ==============================================

-- Update ENUM to include all role types
ALTER TABLE users 
MODIFY COLUMN role ENUM('user', 'receptionist', 'ticket_info', 'admin', 'super_admin') 
DEFAULT 'user';

-- Update existing ticket_info users (IDs 7 and 9)
UPDATE users 
SET role = 'ticket_info' 
WHERE id IN (7, 9) AND (role = '' OR role IS NULL OR role = 'user');

-- Verify the changes
SELECT id, username, email, role, status FROM users WHERE id IN (7, 9);
