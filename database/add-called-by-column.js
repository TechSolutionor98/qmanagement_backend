import mysql from 'mysql2/promise';

const addCalledByColumn = async () => {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'ticket_managementdb'
  });

  try {
    console.log('Adding called_by_user_id column to tickets table...');
    
    // Check if column already exists
    const [columns] = await connection.query(
      "SHOW COLUMNS FROM tickets LIKE 'called_by_user_id'"
    );
    
    if (columns.length === 0) {
      // Add the column
      await connection.query(`
        ALTER TABLE tickets 
        ADD COLUMN called_by_user_id INT NULL AFTER caller,
        ADD INDEX idx_called_by_user_id (called_by_user_id)
      `);
      console.log('✅ called_by_user_id column added successfully');
      
      // Copy existing caller data to called_by_user_id for tickets that have been called
      await connection.query(`
        UPDATE tickets 
        SET called_by_user_id = caller 
        WHERE caller IS NOT NULL AND called_at IS NOT NULL
      `);
      console.log('✅ Existing caller data migrated to called_by_user_id');
    } else {
      console.log('⚠️ called_by_user_id column already exists');
    }
    
  } catch (error) {
    console.error('❌ Error adding column:', error);
  } finally {
    await connection.end();
  }
};

addCalledByColumn();
