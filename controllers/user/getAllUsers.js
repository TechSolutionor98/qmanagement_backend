import pool from '../../config/database.js';

export const getAllUsers = async (req, res) => {
  try {
    const admin_id = req.user.id;

    const [users] = await pool.query(
      'SELECT id, username, email FROM users WHERE admin_id = ? ORDER BY username',
      [admin_id]
    );

    res.json({
      success: true,
      data: users
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
