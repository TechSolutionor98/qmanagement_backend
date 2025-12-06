import pool from '../../config/database.js';

export const getAdminUsers = async (req, res) => {
  try {
    const { adminId } = req.params;

    if (!adminId) {
      return res.status(400).json({
        success: false,
        message: 'Admin ID is required'
      });
    }

    // Get all users under the specified admin with login status
    const [users] = await pool.query(
      `SELECT 
        u.id, 
        u.username, 
        u.email, 
        u.admin_id, 
        u.role, 
        u.status,
        CASE 
          WHEN s.session_id IS NOT NULL THEN 1 
          ELSE 0 
        END as isLoggedIn
      FROM users u
      LEFT JOIN user_sessions s ON u.id = s.user_id 
        AND s.active = 1 
        AND s.expires_at > NOW()
      WHERE u.admin_id = ? 
      ORDER BY u.username`,
      [adminId]
    );

    console.log(`[getAdminUsers] Fetched ${users.length} users for admin ${adminId}`);

    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Error fetching admin users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin users',
      error: error.message
    });
  }
};
