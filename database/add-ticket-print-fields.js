import pool from '../config/database.js';

async function addTicketPrintFields() {
  const connection = await pool.getConnection();
  
  try {
    console.log('🔧 Adding ticket print customization fields to licenses table...\n');

    // Check if ticket_waiting_message already exists
    const [existingMessageCol] = await connection.query(`
      SHOW COLUMNS FROM licenses WHERE Field = 'ticket_waiting_message'
    `);

    if (existingMessageCol.length === 0) {
      await connection.query(`
        ALTER TABLE licenses 
        ADD COLUMN ticket_waiting_message VARCHAR(255) DEFAULT 'Please wait. We will serve you shortly.'
        AFTER max_sessions
      `);
      console.log('✅ Added ticket_waiting_message field to licenses table');
    } else {
      console.log('ℹ️  ticket_waiting_message field already exists');
    }

    // Check if ticket_thank_you_text already exists
    const [existingThankYouCol] = await connection.query(`
      SHOW COLUMNS FROM licenses WHERE Field = 'ticket_thank_you_text'
    `);

    if (existingThankYouCol.length === 0) {
      await connection.query(`
        ALTER TABLE licenses 
        ADD COLUMN ticket_thank_you_text VARCHAR(255) DEFAULT 'Thank you for your service!'
        AFTER ticket_waiting_message
      `);
      console.log('✅ Added ticket_thank_you_text field to licenses table');
    } else {
      console.log('ℹ️  ticket_thank_you_text field already exists');
    }

    // Check if ticket_footer_text already exists
    const [existingFooterCol] = await connection.query(`
      SHOW COLUMNS FROM licenses WHERE Field = 'ticket_footer_text'
    `);

    if (existingFooterCol.length === 0) {
      await connection.query(`
        ALTER TABLE licenses 
        ADD COLUMN ticket_footer_text VARCHAR(255) DEFAULT 'Designed by techsolutionor.com'
        AFTER ticket_thank_you_text
      `);
      console.log('✅ Added ticket_footer_text field to licenses table');
    } else {
      console.log('ℹ️  ticket_footer_text field already exists');
    }

    // Verify the columns in licenses table
    const [columns] = await connection.query(`
      SHOW COLUMNS FROM licenses WHERE Field IN ('ticket_waiting_message', 'ticket_thank_you_text', 'ticket_footer_text')
    `);

    console.log('\n📋 Added fields verification details:');
    columns.forEach(col => {
      console.log(`- ${col.Field}: type=${col.Type}, default=${col.Default}`);
    });

    console.log('\n🎉 Ticket print fields migration completed successfully!');

  } catch (error) {
    console.error('❌ Error during ticket print fields migration:', error.message);
    throw error;
  } finally {
    connection.release();
    await pool.end();
  }
}

addTicketPrintFields().catch(console.error);
