import pool from '../../config/database.js';

export const deleteUserServices = async (req, res) => {
  try {
    const { user_id } = req.params;
    const admin_id = req.user.id;

    // Verify user belongs to this admin
    const [users] = await pool.query('SELECT id FROM users WHERE id = ? AND admin_id = ?', [user_id, admin_id]);
    if (users.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'User not found or unauthorized'
      });
    }

    await pool.query('DELETE FROM user_services WHERE user_id = ?', [user_id]);

    res.json({
      success: true,
      message: 'All services removed from user'
    });
  } catch (error) {
    console.error('Error deleting user services:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete services',
      error: error.message
    });
  }
};
