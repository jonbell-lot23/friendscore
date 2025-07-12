const { Pool } = require('pg')

const pool = new Pool({
  connectionString: 'postgres://postgres.rvuurnkyjtaoowceghlj:gekcEn-toqdi8-fokzit@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres',
  ssl: {
    rejectUnauthorized: false
  }
})

async function createFriendScoresTable() {
  try {
    console.log('🛠️  Creating friend_scores table...\n')
    
    await pool.query(`
      CREATE TABLE friend_scores (
        date DATE PRIMARY KEY,
        score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    console.log('✅ friend_scores table created successfully!')
    console.log('\n📊 Table structure:')
    console.log('   date: DATE (Primary Key) - Format: YYYY-MM-DD')
    console.log('   score: INTEGER (0-100) - The friend score')
    console.log('   created_at: TIMESTAMP - When record was first created')
    console.log('   updated_at: TIMESTAMP - When record was last modified')
    
    console.log('\n🎯 The table is ready for your friend score app!')
    
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('✅ friend_scores table already exists - no action needed')
    } else {
      console.error('❌ Error creating table:', error.message)
    }
  } finally {
    await pool.end()
  }
}

createFriendScoresTable()