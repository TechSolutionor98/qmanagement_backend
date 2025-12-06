import pool from '../../config/database.js';

export const assignServicesToUser = async (req, res) => {
  try {
    const { user_id, service_ids, admin_id } = req.body;
    // Use admin_id from request body if provided (when assigning from modal), otherwise use logged-in user's ID
    const finalAdminId = admin_id || req.user.id;

    if (!user_id || !service_ids || !Array.isArray(service_ids)) {
      return res.status(400).json({
        success: false,
        message: 'user_id and service_ids array are required'
      });
    }

    // Verify user belongs to this admin
    const [users] = await pool.query('SELECT id FROM users WHERE id = ? AND admin_id = ?', [user_id, finalAdminId]);
    if (users.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'User not found or unauthorized'
      });
    }

    // Delete existing assignments for this user
    await pool.query('DELETE FROM user_services WHERE user_id = ?', [user_id]);

    // Insert new assignments
    if (service_ids.length > 0) {
      const values = service_ids.map(service_id => [user_id, service_id]);
      await pool.query('INSERT INTO user_services (user_id, service_id) VALUES ?', [values]);
    }

    res.json({
      success: true,
      message: 'Services assigned successfully'
    });
  } catch (error) {
    console.error('Error assigning services:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign services',
      error: error.message
    });
  }
};
