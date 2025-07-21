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
      SELECT date, score 
      FROM friend_scores 
      ORDER BY date DESC
    `)
    
    if (result.rows.length === 0) {
      return NextResponse.json({ 
        currentStreak: 0,
        longestStreak: 0,
        totalDays: 0,
        lastRecordedDate: null
      })
    }
    
    // Calculate current streak
    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 1
    
    const dates = result.rows.map(row => new Date(row.date))
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Check if the most recent date is today or yesterday
    const mostRecentDate = dates[0]
    mostRecentDate.setHours(0, 0, 0, 0)
    const daysSinceLastRecord = Math.floor((today.getTime() - mostRecentDate.getTime()) / (1000 * 60 * 60 * 24))
    
    // If last record was more than 1 day ago, current streak is 0
    if (daysSinceLastRecord > 1) {
      currentStreak = 0
    } else {
      // Calculate current streak
      currentStreak = 1
      for (let i = 1; i < dates.length; i++) {
        const currentDate = new Date(dates[i])
        const prevDate = new Date(dates[i - 1])
        currentDate.setHours(0, 0, 0, 0)
        prevDate.setHours(0, 0, 0, 0)
        
        const diffDays = Math.floor((prevDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))
        
        if (diffDays === 1) {
          currentStreak++
        } else {
          break
        }
      }
    }
    
    // Calculate longest streak
    for (let i = 1; i < dates.length; i++) {
      const currentDate = new Date(dates[i])
      const prevDate = new Date(dates[i - 1])
      currentDate.setHours(0, 0, 0, 0)
      prevDate.setHours(0, 0, 0, 0)
      
      const diffDays = Math.floor((prevDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (diffDays === 1) {
        tempStreak++
      } else {
        longestStreak = Math.max(longestStreak, tempStreak)
        tempStreak = 1
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak, currentStreak)
    
    return NextResponse.json({ 
      currentStreak,
      longestStreak,
      totalDays: result.rows.length,
      lastRecordedDate: result.rows[0].date
    })
  } catch (error) {
    console.error('Error calculating streak:', error)
    return NextResponse.json({ error: 'Failed to calculate streak' }, { status: 500 })
  }
}