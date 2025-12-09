import pool from "../../config/database.js";

export const getUserCounter = async (req, res) => {
  const userId = req.user.id; // From authenticateToken middleware

  try {
    // Get user's active session with counter - use 'active' column
    const [sessions] = await pool.query(
      `SELECT counter_no, active 
       FROM user_sessions 
       WHERE user_id = ? AND active = 1 AND expires_at > NOW()
       ORDER BY created_at DESC 
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
        counter_no: null
      });
    }

    res.json({
      success: true,
      counter_no: counter_no,
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
