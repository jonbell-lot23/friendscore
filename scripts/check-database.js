const { Pool } = require('pg')

const pool = new Pool({
  connectionString: 'postgres://postgres.rvuurnkyjtaoowceghlj:gekcEn-toqdi8-fokzit@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres',
  ssl: {
    rejectUnauthorized: false
  }
})

async function checkDatabase() {
  try {
    console.log('🔍 Checking existing tables in database...\n')
    
    // List all tables
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `)
    
    console.log('📋 Current tables in database:')
    if (tablesResult.rows.length === 0) {
      console.log('   (No tables found)')
    } else {
      tablesResult.rows.forEach((row, index) => {
        console.log(`   ${index + 1}. ${row.table_name}`)
      })
    }
    
    console.log('\n🔍 Checking if friend_scores table exists...')
    const friendScoreExists = tablesResult.rows.some(row => row.table_name === 'friend_scores')
    
    if (friendScoreExists) {
      console.log('✅ friend_scores table already exists')
      
      // Show the table structure
      const structureResult = await pool.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'friend_scores' AND table_schema = 'public'
        ORDER BY ordinal_position
      `)
      
      console.log('\n📊 Table structure:')
      structureResult.rows.forEach(col => {
        console.log(`   ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`)
      })
      
    } else {
      console.log('❌ friend_scores table does not exist')
      console.log('\n🛠️  To create it safely, run: node scripts/create-table.js')
    }
    
  } catch (error) {
    console.error('❌ Error checking database:', error.message)
  } finally {
    await pool.end()
  }
}

checkDatabase()