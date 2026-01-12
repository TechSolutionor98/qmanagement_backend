-- Add text_color column to services table
-- This migration adds a text_color field to store the text color for services

ALTER TABLE `services` 
ADD COLUMN `text_color` VARCHAR(7) DEFAULT '#FFFFFF' 
AFTER `color`;
