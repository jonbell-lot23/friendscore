import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
})

export async function GET() {
  // Get today's date in NZ timezone
  const today = new Date().toLocaleDateString('en-CA', { 
    timeZone: 'Pacific/Auckland' 
  }) // YYYY-MM-DD format
  
  try {
    const result = await pool.query(
      'SELECT score FROM friend_scores WHERE date = $1',
      [today]
    )
    
    const score = result.rows.length > 0 ? result.rows[0].score : null
    
    return NextResponse.json({ score })
  } catch (error) {
    console.error('Error getting today\'s score:', error)
    return NextResponse.json({ error: 'Failed to get score' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  // Get today's date in NZ timezone
  const today = new Date().toLocaleDateString('en-CA', { 
    timeZone: 'Pacific/Auckland' 
  }) // YYYY-MM-DD format
  
  try {
    const { score } = await request.json()
    
    if (typeof score !== 'number' || score < 0 || score > 100) {
      return NextResponse.json({ error: 'Invalid score' }, { status: 400 })
    }
    
    await pool.query(
      `INSERT INTO friend_scores (date, score) 
       VALUES ($1, $2) 
       ON CONFLICT (date) 
       DO UPDATE SET score = EXCLUDED.score, updated_at = CURRENT_TIMESTAMP`,
      [today, score]
    )
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving score:', error)
    return NextResponse.json({ error: 'Failed to save score' }, { status: 500 })
  }
}