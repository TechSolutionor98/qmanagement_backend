-- Create voice_settings table for storing admin voice configuration
CREATE TABLE IF NOT EXISTS voice_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT,
    voice_type VARCHAR(50) DEFAULT 'default',
    language VARCHAR(10) DEFAULT 'en',
    speech_rate DECIMAL(3,2) DEFAULT 0.9,
    speech_pitch DECIMAL(3,2) DEFAULT 1.0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admin(id) ON DELETE CASCADE,
    INDEX idx_admin_id (admin_id),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default settings
INSERT INTO voice_settings (admin_id, voice_type, language, speech_rate, speech_pitch, is_active)
VALUES (1, 'default', 'en', 0.9, 1.0, TRUE)
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;
