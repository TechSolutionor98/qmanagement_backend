import pool from '../config/database.js';

async function checkServicesTable() {
  try {
    const [columns] = await pool.query('DESCRIBE services');
    console.log('📊 Services Table Structure:');
    columns.forEach(col => {
      console.log(`  ${col.Field} - ${col.Type} (${col.Null === 'YES' ? 'Nullable' : 'NOT NULL'})`);
    });
    pool.end();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkServicesTable();
