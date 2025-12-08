import pool from "../../config/database.js";

export const deleteUser = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { id } = req.params;

    console.log('🗑️ Deleting User:', id);

    // Check if user exists
    const [users] = await connection.query(
      "SELECT id, username, role FROM users WHERE id = ?",
      [id]
    );

    if (users.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Delete user sessions first (foreign key constraint)
    await connection.query(
      "DELETE FROM user_sessions WHERE user_id = ?",
      [id]
    );

    // Delete user
    await connection.query(
      "DELETE FROM users WHERE id = ?",
      [id]
    );

    await connection.commit();

    console.log('✅ User Deleted:', users[0].username);

    res.status(200).json({
      success: true,
      message: "User deleted successfully"
    });

  } catch (error) {
    await connection.rollback();
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete user",
      error: error.message
    });
  } finally {
    connection.release();
  }
};
