import pool from './config/database.js';

async function verifyRoleEnum() {
  try {
    console.log('🔍 Verifying role ENUM...\n');
    
    // Check ENUM definition
    const [columns] = await pool.query(
      "SHOW COLUMNS FROM users WHERE Field = 'role'"
    );
    
    console.log('✅ Role Column Definition:');
    console.log('Type:', columns[0].Type);
    console.log('Null:', columns[0].Null);
    console.log('Default:', columns[0].Default);
    
    // Check if 'ticket_info' is in ENUM
    const enumValues = columns[0].Type;
    const hasTicketInfo = enumValues.includes('ticket_info');
    
    console.log('\n🎯 Verification:');
    console.log('Contains ticket_info:', hasTicketInfo ? '✅ YES' : '❌ NO');
    
    if (hasTicketInfo) {
      console.log('\n✅ ENUM is correct! Role will persist on server restart.');
    } else {
      console.log('\n❌ ENUM is missing ticket_info! Need to fix init-database.js');
    }
    
    // Check users with ticket_info role
    const [users] = await pool.query(
      "SELECT id, username, email, role FROM users WHERE id IN (7, 9)"
    );
    
    console.log('\n📋 Ticket Info Users:');
    console.table(users);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

verifyRoleEnum();
