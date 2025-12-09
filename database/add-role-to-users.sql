-- Add role column to users table with all role types

ALTER TABLE `users`
MODIFY COLUMN `role` ENUM('user', 'receptionist', 'ticket_info', 'admin', 'super_admin') DEFAULT 'user';

