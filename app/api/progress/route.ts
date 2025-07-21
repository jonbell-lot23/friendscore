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
      SELECT date, score, created_at, updated_at 
      FROM friend_scores 
      ORDER BY date DESC
    `)
    
    if (result.rows.length === 0) {
      return NextResponse.json({ 
        totalScore: 0,
        averageScore: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalDays: 0,
        perfectDays: 0,
        lastRecordedDate: null,
        scores: []
      })
    }
    
    // Calculate metrics
    let totalScore = 0
    let perfectDays = 0
    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 1
    
    const dates = result.rows.map(row => {
      totalScore += row.score
      if (row.score === 100) perfectDays++
      return new Date(row.date)
    })
    
    const averageScore = Math.round(totalScore / result.rows.length)
    
    // Calculate current streak
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const mostRecentDate = dates[0]
    mostRecentDate.setHours(0, 0, 0, 0)
    const daysSinceLastRecord = Math.floor((today.getTime() - mostRecentDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysSinceLastRecord > 1) {
      currentStreak = 0
    } else {
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
      totalScore,
      averageScore,
      currentStreak,
      longestStreak,
      totalDays: result.rows.length,
      perfectDays,
      lastRecordedDate: result.rows[0].date,
      scores: result.rows
    })
  } catch (error) {
    console.error('Error fetching progress:', error)
    return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 })
  }
}