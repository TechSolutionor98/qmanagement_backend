import pool from './config/database.js';

async function fixVoiceType() {
    try {
        const [result] = await pool.execute(
            `UPDATE voice_settings 
             SET voice_type = 'male' 
             WHERE voice_type = 'default' 
             OR voice_type IS NULL 
             OR voice_type = ''`
        );
        
        console.log('✅ Database updated!');
        console.log(`   Rows affected: ${result.affectedRows}`);
        console.log('   Changed all default/empty voice_type to "male"');
        
        // Show current values
        const [rows] = await pool.execute('SELECT * FROM voice_settings');
        console.log('\n📋 Current voice_settings:');
        rows.forEach(row => {
            console.log(`   Admin ID: ${row.admin_id}, Voice Type: ${row.voice_type}`);
        });
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

fixVoiceType();
