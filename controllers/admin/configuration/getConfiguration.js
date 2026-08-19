import pool from "../../../config/database.js"

export const getConfiguration = async (req, res) => {
  const adminId = req.query.admin_id || req.user?.admin_id || req.user?.id
  const connection = await pool.getConnection()
  try {
    let query = "SELECT * FROM admin_btn_settings"
    let params = []
    
    if (adminId) {
      query += " WHERE admin_id = ?"
      params.push(adminId)
    }

    const [settings] = await connection.query(query, params)

    const config = {}
    settings.forEach(setting => {
      config[setting.setting_name] = setting.setting_value
    })

    res.json({ success: true, configuration: config })
  } catch (error) {
    console.error("Error fetching configuration:", error)
    res.status(500).json({ success: false, message: "Failed to fetch configuration", error: error.message })
  } finally {
    connection.release()
  }
}
