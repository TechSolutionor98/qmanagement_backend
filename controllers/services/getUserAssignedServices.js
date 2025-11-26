import pool from '../../config/database.js';

export const getUserAssignedServices = async (req, res) => {
  try {
    const admin_id = req.user.id;

    // Get only users who have assigned services (with non-null services)
    const [assignments] = await pool.query(`
      SELECT 
        u.id as user_id,
        u.username,
        GROUP_CONCAT(s.service_name SEPARATOR ', ') as services,
        GROUP_CONCAT(s.id) as service_ids
      FROM users u
      INNER JOIN user_services us ON u.id = us.user_id
      INNER JOIN services s ON us.service_id = s.id
      WHERE u.admin_id = ? AND s.id IS NOT NULL
      GROUP BY u.id, u.username
      HAVING services IS NOT NULL
      ORDER BY u.username
    `, [admin_id]);

    res.json({
      success: true,
      data: assignments
    });
  } catch (error) {
    console.error('Error fetching user assigned services:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assigned services',
      error: error.message
    });
  }
};
