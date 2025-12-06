import pool from '../../config/database.js';

/**
 * Get voice settings for current admin or default settings
 */
export const getVoiceSettings = async (req, res) => {
  try {
    const { adminId } = req.query;
    const userRole = req.user?.role;
    
    // Determine which admin's settings to fetch
    let targetAdminId;
    
    console.log('🔍 Voice Settings GET - Debug Info:');
    console.log('  adminId from query:', adminId);
    console.log('  user role:', userRole);
    console.log('  user id:', req.user?.id);
    
    if (adminId) {
      targetAdminId = parseInt(adminId);
      console.log('  ✅ Using adminId from query:', targetAdminId);
    } else if (userRole === 'admin') {
      targetAdminId = req.user.id;
      console.log('  ✅ Using admin user id:', targetAdminId);
    } else if (userRole === 'user') {
      targetAdminId = req.user.admin_id;
      console.log('  ✅ Using user admin_id:', targetAdminId);
    } else {
      console.log('  ⚠️ WARNING: No adminId found, using default 1');
      targetAdminId = 1;
    }
    
    console.log('  📌 Final targetAdminId for voice settings:', targetAdminId);
    
    // Try to get admin's settings
    const [settings] = await pool.query(
      'SELECT * FROM voice_settings WHERE admin_id = ? AND is_active = TRUE ORDER BY updated_at DESC LIMIT 1',
      [targetAdminId]
    );
    
    // If no settings found, return defaults
    if (settings.length === 0) {
      return res.json({
        success: true,
        settings: {
          voice_type: 'default',
          language: 'en',
          languages: JSON.stringify(['en']), // Support multiple languages
          speech_rate: 0.9,
          speech_pitch: 1.0
        },
        message: 'Using default settings'
      });
    }
    
    res.json({
      success: true,
      settings: {
        voice_type: settings[0].voice_type,
        language: settings[0].language,
        languages: settings[0].languages || JSON.stringify([settings[0].language || 'en']), // Multiple languages support
        speech_rate: parseFloat(settings[0].speech_rate),
        speech_pitch: parseFloat(settings[0].speech_pitch)
      }
    });
    
  } catch (error) {
    console.error('Error getting voice settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get voice settings',
      error: error.message
    });
  }
};

/**
 * Save or update voice settings
 */
export const saveVoiceSettings = async (req, res) => {
  try {
    const { voice_type, language, languages, speech_rate, speech_pitch, admin_id } = req.body;
    const userRole = req.user?.role;
    
    // Determine which admin's settings to save
    let targetAdminId;
    
    console.log('🔍 Voice Settings SAVE - Debug Info:');
    console.log('  admin_id from body:', admin_id);
    console.log('  user role:', userRole);
    console.log('  user id:', req.user?.id);
    
    if (admin_id) {
      targetAdminId = parseInt(admin_id);
      console.log('  ✅ Using admin_id from body:', targetAdminId);
    } else if (userRole === 'admin') {
      targetAdminId = req.user.id;
      console.log('  ✅ Using admin user id:', targetAdminId);
    } else if (userRole === 'user') {
      targetAdminId = req.user.admin_id;
      console.log('  ✅ Using user admin_id:', targetAdminId);
    } else {
      console.log('  ⚠️ WARNING: No admin_id found, using default 1');
      targetAdminId = 1;
    }
    
    console.log('  📌 Final targetAdminId for save:', targetAdminId);
    
    console.log('💾 Saving voice settings:', {
      targetAdminId,
      voice_type,
      language,
      languages,
      speech_rate,
      speech_pitch
    });
    
    // Support both single language and multiple languages
    const languagesData = languages || JSON.stringify([language || 'en']);
    const primaryLanguage = language || (languages ? JSON.parse(languages)[0] : 'en');
    
    // Check if settings already exist
    const [existing] = await pool.query(
      'SELECT id FROM voice_settings WHERE admin_id = ? AND is_active = TRUE',
      [targetAdminId]
    );
    
    if (existing.length > 0) {
      // Update existing settings
      await pool.query(
        `UPDATE voice_settings 
         SET voice_type = ?, language = ?, languages = ?, speech_rate = ?, speech_pitch = ?, updated_at = CURRENT_TIMESTAMP
         WHERE admin_id = ? AND is_active = TRUE`,
        [
          voice_type || 'default',
          primaryLanguage,
          languagesData,
          speech_rate || 0.9,
          speech_pitch || 1.0,
          targetAdminId
        ]
      );
      
      console.log('✅ Settings updated in database');
    } else {
      // Insert new settings
      await pool.query(
        `INSERT INTO voice_settings (admin_id, voice_type, language, languages, speech_rate, speech_pitch, is_active)
         VALUES (?, ?, ?, ?, ?, ?, TRUE)`,
        [
          targetAdminId,
          voice_type || 'default',
          primaryLanguage,
          languagesData,
          speech_rate || 0.9,
          speech_pitch || 1.0
        ]
      );
      
      console.log('✅ New settings inserted in database');
    }
    
    res.json({
      success: true,
      message: 'Voice settings saved successfully',
      settings: {
        voice_type: voice_type || 'default',
        language: primaryLanguage,
        languages: languagesData,
        speech_rate: speech_rate || 0.9,
        speech_pitch: speech_pitch || 1.0
      }
    });
    
  } catch (error) {
    console.error('Error saving voice settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save voice settings',
      error: error.message
    });
  }
};

/**
 * Delete voice settings (set inactive)
 */
export const deleteVoiceSettings = async (req, res) => {
  try {
    const { admin_id } = req.body;
    const userRole = req.user?.role;
    
    let targetAdminId;
    if (admin_id) {
      targetAdminId = parseInt(admin_id);
    } else if (userRole === 'admin') {
      targetAdminId = req.user.id;
    } else if (userRole === 'user') {
      targetAdminId = req.user.admin_id;
    } else {
      targetAdminId = 1;
    }
    
    await pool.query(
      'UPDATE voice_settings SET is_active = FALSE WHERE admin_id = ?',
      [targetAdminId]
    );
    
    res.json({
      success: true,
      message: 'Voice settings deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting voice settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete voice settings',
      error: error.message
    });
  }
};
