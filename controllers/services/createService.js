import pool from '../../config/database.js';

export const createService = async (req, res) => {
  try {
    const { service_name, service_name_arabic, initial_ticket, color } = req.body;
    const admin_id = req.user.id; // Get admin_id from authenticated user
    
    // Get logo path from uploaded file
    const logo_url = req.file ? `/uploads/services/${req.file.filename}` : null;

    const [result] = await pool.query(
      `INSERT INTO services (admin_id, service_name, service_name_arabic, initial_ticket, color, logo_url, show_sub_service_popup) 
       VALUES (?, ?, ?, ?, ?, ?, 0)`,
      [admin_id, service_name, service_name_arabic, initial_ticket, color, logo_url]
    );

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: {
        id: result.insertId,
        service_name,
        service_name_arabic,
        initial_ticket,
        color,
        logo_url
      }
    });
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create service',
      error: error.message
    });
  }
};
