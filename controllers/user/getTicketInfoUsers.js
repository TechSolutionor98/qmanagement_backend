import pool from "../../config/database.js";

export const getTicketInfoUsers = async (req, res) => {
  try {
    const { adminId } = req.query;

    if (!adminId) {
      return res.status(400).json({
        success: false,
        message: "Admin ID is required"
      });
    }

    console.log('📋 Fetching Ticket Info Users for Admin:', adminId);

    const [users] = await pool.query(
      `SELECT 
        id, username, email, role, status, created_at
      FROM users 
      WHERE admin_id = ? AND role = 'ticket_info'
      ORDER BY created_at DESC`,
      [adminId]
    );

    console.log('✅ Found', users.length, 'ticket_info users');

    res.status(200).json({
      success: true,
      users: users
    });

  } catch (error) {
    console.error("Get ticket info users error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch ticket info users",
      error: error.message
    });
  }
};
