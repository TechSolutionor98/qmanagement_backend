import pool from '../../config/database.js';

export const getAdminServices = async (req, res) => {
  try {
    const { adminId } = req.params;
    
    if (!adminId) {
      return res.status(400).json({
        success: false,
        message: 'Admin ID is required'
      });
    }
    
    const [services] = await pool.query(
      `SELECT id, service_name, service_name_arabic, initial_ticket, color, logo_url, 
              show_sub_service_popup, created_at, updated_at 
       FROM services 
       WHERE admin_id = ?
       ORDER BY created_at DESC`,
      [adminId]
    );

    res.json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (error) {
    console.error('Error fetching admin services:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin services',
      error: error.message
    });
  }
};
