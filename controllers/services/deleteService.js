import pool from '../../config/database.js';

export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const admin_id = req.user.id; // Get admin_id from authenticated user

    await pool.query('DELETE FROM services WHERE id = ? AND admin_id = ?', [id, admin_id]);

    res.json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete service',
      error: error.message
    });
  }
};
