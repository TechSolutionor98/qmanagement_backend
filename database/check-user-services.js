import pool from '../config/database.js';

async function checkUserServicesTable() {
  try {
    const [columns] = await pool.query('DESCRIBE user_services');
    console.log('📊 user_services Table Structure:');
    columns.forEach(col => {
      console.log(`  ${col.Field} - ${col.Type} (${col.Null === 'YES' ? 'Nullable' : 'NOT NULL'})`);
    });
    pool.end();
  } catch (error) {
    console.log('❌ user_services table does not exist');
    pool.end();
  }
}

checkUserServicesTable();
