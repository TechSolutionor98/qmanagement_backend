import pool from '../config/database.js';

async function addTicketLayoutField() {
  const connection = await pool.getConnection();
  
  try {
    console.log('🔧 Adding ticket_layout field to licenses table...\n');

    // Check if ticket_layout already exists
    const [existingCol] = await connection.query(`
      SHOW COLUMNS FROM licenses WHERE Field = 'ticket_layout'
    `);

    if (existingCol.length === 0) {
      await connection.query(`
        ALTER TABLE licenses 
        ADD COLUMN ticket_layout TEXT DEFAULT NULL
        AFTER ticket_footer_text
      `);
      console.log('✅ Added ticket_layout field to licenses table');
    } else {
      console.log('ℹ️  ticket_layout field already exists');
    }

    // Verify
    const [columns] = await connection.query(`
      SHOW COLUMNS FROM licenses WHERE Field = 'ticket_layout'
    `);

    if (columns.length > 0) {
      console.log('\n✅ Verification successful!');
      console.log('📋 Field details:', columns[0]);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    connection.release();
    await pool.end();
  }
}

addTicketLayoutField().catch(console.error);
