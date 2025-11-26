import pool from '../../config/database.js';

export const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { service_name, service_name_arabic, initial_ticket, color } = req.body;
    const admin_id = req.user.id; // Get admin_id from authenticated user
    
    // Get logo path from uploaded file if new file is uploaded
    const logo_url = req.file ? `/uploads/services/${req.file.filename}` : undefined;

    let query = `UPDATE services SET service_name = ?, service_name_arabic = ?, initial_ticket = ?, color = ?`;
    let params = [service_name, service_name_arabic, initial_ticket, color];

    if (logo_url) {
      query += `, logo_url = ?`;
      params.push(logo_url);
    }

    query += ` WHERE id = ? AND admin_id = ?`;
    params.push(id, admin_id);

    await pool.query(query, params);

    res.json({
      success: true,
      message: 'Service updated successfully'
    });
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update service',
      error: error.message
    });
  }
};
