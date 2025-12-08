-- Migration to add session limit fields for receptionists and ticket_info users
-- Date: 2025-12-08

-- Add new columns to licenses table
ALTER TABLE licenses 
ADD COLUMN max_receptionists INT DEFAULT 5 COMMENT 'Maximum number of reception role users allowed';

ALTER TABLE licenses 
ADD COLUMN max_ticket_info_users INT DEFAULT 3 COMMENT 'Maximum number of ticket_info screen users allowed';

ALTER TABLE licenses 
ADD COLUMN max_sessions_per_receptionist INT DEFAULT 1 COMMENT 'Maximum concurrent sessions allowed per receptionist (1-5)';

ALTER TABLE licenses 
ADD COLUMN max_sessions_per_ticket_info INT DEFAULT 1 COMMENT 'Maximum concurrent sessions allowed per ticket_info user (1-5)';

-- Update existing licenses with default values if they are NULL
UPDATE licenses 
SET 
  max_receptionists = COALESCE(max_receptionists, 5),
  max_ticket_info_users = COALESCE(max_ticket_info_users, 3),
  max_sessions_per_receptionist = COALESCE(max_sessions_per_receptionist, 1),
  max_sessions_per_ticket_info = COALESCE(max_sessions_per_ticket_info, 1);
