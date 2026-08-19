import pool from "../../../config/database.js"

export const updateConfiguration = async (req, res) => {
  const { setting_name, setting_value, admin_id } = req.body
  const adminId = admin_id || req.user?.admin_id || req.user?.id || 1

  if (!setting_name || setting_value === undefined) {
    return res.status(400).json({ success: false, message: "Setting name and value required" })
  }

  const connection = await pool.getConnection()
  try {
    const valString = typeof setting_value === 'object' ? JSON.stringify(setting_value) : String(setting_value)
    
    await connection.query(
      "INSERT INTO admin_btn_settings (admin_id, setting_name, setting_value) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE setting_value = ?",
      [adminId, setting_name, valString, valString]
    )

    res.json({ success: true, message: "Configuration updated successfully" })
  } catch (error) {
    console.error("Error updating configuration:", error)
    res.status(500).json({ success: false, message: "Failed to update configuration", error: error.message })
  } finally {
    connection.release()
  }
}
