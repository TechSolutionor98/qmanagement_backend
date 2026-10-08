import pool from "../../config/database.js";

export const getUserCounter = async (req, res) => {
  const userId = req.user.id; // From authenticateToken middleware

  try {
    // Get user's active session with counter - use 'active' column and join counter names
    const [sessions] = await pool.query(
      `SELECT s.counter_no, s.active, u.admin_id, acn.counter_name 
       FROM user_sessions s
       JOIN users u ON s.user_id = u.id
       LEFT JOIN admin_counter_names acn ON u.admin_id = acn.admin_id AND s.counter_no = acn.counter_no
       WHERE s.user_id = ? AND s.active = 1 AND s.expires_at > NOW()
       ORDER BY s.created_at DESC 
       LIMIT 1`,
      [userId]
    );

    if (sessions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No active session found"
      });
    }

    const counter_no = sessions[0].counter_no;

    if (!counter_no || counter_no === null || counter_no === 'null') {
      return res.status(400).json({
        success: false,
        message: "No counter assigned to this session",
        counter_no: null,
        counter_name: null
      });
    }

    const counter_name = sessions[0].counter_name || `Counter ${counter_no}`;

    res.json({
      success: true,
      counter_no: counter_no,
      counter_name: counter_name,
      is_active: sessions[0].active
    });
  } catch (error) {
    console.error("[getUserCounter] Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get counter information"
    });
  }
};
