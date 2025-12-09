import pool from "./config/database.js";

async function addTicketInfoRole() {
  try {
    console.log("🔄 Adding 'ticket_info' to role ENUM...\n");

    // Add ticket_info to ENUM
    const alterQuery = `
      ALTER TABLE users 
      MODIFY role ENUM('user', 'receptionist', 'ticket_info', 'admin', 'super_admin') 
      DEFAULT 'user'
    `;

    await pool.query(alterQuery);
    console.log("✅ Successfully added 'ticket_info' to role ENUM");

    // Update empty role users to ticket_info
    const updateQuery = `
      UPDATE users 
      SET role = 'ticket_info' 
      WHERE id IN (9, 7) AND (role = '' OR role IS NULL)
    `;

    const [result] = await pool.query(updateQuery);
    console.log(`✅ Updated ${result.affectedRows} users to ticket_info role`);

    // Verify
    const [users] = await pool.query(
      "SELECT id, username, email, role FROM users WHERE id IN (9, 7)"
    );
    
    console.log("\n📋 Updated Users:");
    console.table(users);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

addTicketInfoRole();
