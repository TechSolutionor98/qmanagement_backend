import pool from '../../config/database.js';

export const getAllUsers = async (req, res) => {
  try {
    const userId = req.user.id;

    // First get the admin_id of the current user
    const [currentUserData] = await pool.query(
      'SELECT admin_id FROM users WHERE id = ?',
      [userId]
    );

    if (!currentUserData || currentUserData.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const admin_id = currentUserData[0].admin_id;

    // Get all users under the same admin (excluding current user)
    const [users] = await pool.query(
      'SELECT id, username, email, admin_id FROM users WHERE admin_id = ? AND id != ? ORDER BY username',
      [admin_id, userId]
    );

    console.log(`[getAllUsers] User ${userId} (admin_id: ${admin_id}) fetched ${users.length} users`);

    res.json({
      success: true,
      users: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
};
