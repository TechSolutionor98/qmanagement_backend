import pool from '../../config/database.js';

export const getAdminAssignedServices = async (req, res) => {
  try {
    const { adminId } = req.params;

    if (!adminId) {
      return res.status(400).json({
        success: false,
        message: 'Admin ID is required'
      });
    }

    // Get all assigned services for users under this admin, grouped by user
    const [assignedServices] = await pool.query(
      `SELECT 
        u.id as user_id,
        u.username,
        u.email,
        GROUP_CONCAT(CONCAT(s.service_name, ' (', s.service_name_arabic, ')') SEPARATOR ', ') as services,
        GROUP_CONCAT(s.id) as service_ids
       FROM users u
       LEFT JOIN user_services us ON u.id = us.user_id
       LEFT JOIN services s ON us.service_id = s.id
       WHERE u.admin_id = ?
       GROUP BY u.id, u.username, u.email
       ORDER BY u.username ASC`,
      [adminId]
    );

    console.log(`[getAdminAssignedServices] Fetched ${assignedServices.length} users with assigned services for admin ${adminId}`);

    res.json({
      success: true,
      count: assignedServices.length,
      data: assignedServices
    });
  } catch (error) {
    console.error('Error fetching admin assigned services:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin assigned services',
      error: error.message
    });
  }
};
