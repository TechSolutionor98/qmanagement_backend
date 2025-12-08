import pool from './config/database.js';

async function testLicenseTable() {
  try {
    console.log('🧪 Testing licenses table structure...\n');
    
    // Check all columns
    const [columns] = await pool.query(`DESCRIBE licenses`);
    
    console.log('📋 All License Table Columns:');
    columns.forEach(col => {
      console.log(`   ${col.Field.padEnd(35)} ${col.Type.padEnd(20)} ${col.Default !== null ? `(Default: ${col.Default})` : ''}`);
    });
    
    // Check if we have any licenses
    const [licenses] = await pool.query(`
      SELECT 
        id, 
        company_name, 
        max_users,
        max_counters,
        max_receptionists, 
        max_ticket_info_users, 
        max_sessions_per_receptionist, 
        max_sessions_per_ticket_info 
      FROM licenses 
      LIMIT 3
    `);
    
    console.log(`\n📦 Found ${licenses.length} license(s) in database`);
    
    if (licenses.length > 0) {
      console.log('\n✅ Sample License Data:');
      licenses.forEach((lic, idx) => {
        console.log(`\n   License ${idx + 1}: ${lic.company_name || 'N/A'} (ID: ${lic.id})`);
        console.log(`      Max Users: ${lic.max_users}`);
        console.log(`      Max Counters: ${lic.max_counters}`);
        console.log(`      Max Receptionists: ${lic.max_receptionists}`);
        console.log(`      Max Ticket Info Users: ${lic.max_ticket_info_users}`);
        console.log(`      Sessions/Receptionist: ${lic.max_sessions_per_receptionist}`);
        console.log(`      Sessions/Ticket Info: ${lic.max_sessions_per_ticket_info}`);
      });
    }
    
    console.log('\n✨ All fields are ready! You can now:');
    console.log('   1. Create new licenses with session limits');
    console.log('   2. Update existing licenses');
    console.log('   3. Frontend form will save all values to database\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

testLicenseTable();
