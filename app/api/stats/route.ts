import { NextResponse } from 'next/server'
import { Pool } from 'pg'

export const dynamic = 'force-dynamic'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
})

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT 
        date, 
        score, 
        created_at, 
        updated_at 
      FROM friend_scores 
      ORDER BY date DESC
    `)
    
    return NextResponse.json({ scores: result.rows })
  } catch (error) {
    console.error('Error fetching score stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}