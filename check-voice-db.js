const mysql = require('mysql2/promise');

(async () => {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'queue_management'
  });
  
  console.log('\n📊 CURRENT DATABASE VALUES:');
  console.log('═'.repeat(60));
  
  const [rows] = await pool.query('SELECT * FROM voice_settings');
  
  rows.forEach(row => {
    console.log(`\nAdmin ID: ${row.admin_id}`);
    console.log(`  voice_type: '${row.voice_type}'`);
    console.log(`  languages: ${row.languages}`);
    console.log(`  speech_rate: ${row.speech_rate}`);
    console.log(`  speech_pitch: ${row.speech_pitch}`);
  });
  
  console.log('\n' + '═'.repeat(60));
  console.log('Issue: Browser sending "default" instead of actual value');
  console.log('Fix needed: Browser must send correct voice_type from database\n');
  
  await pool.end();
})();
