'use client'
import { useState, useEffect } from 'react'

interface StreakData {
  currentStreak: number
  longestStreak: number
  totalDays: number
  lastRecordedDate: string | null
}

export default function StreakPage() {
  const [streakData, setStreakData] = useState<StreakData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStreak() {
      try {
        const response = await fetch('/api/streak')
        if (response.ok) {
          const data = await response.json()
          setStreakData(data)
        }
      } catch (error) {
        console.error('Error fetching streak:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchStreak()
  }, [])
  
  return (
    <div className="min-h-screen bg-emerald-900 p-8 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        <h1 className="text-6xl font-bold text-white mb-12 text-center">
          Your Streak
        </h1>
        
        {loading ? (
          <div className="text-center text-white/60">
            Loading...
          </div>
        ) : streakData ? (
          <div className="space-y-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center">
              <div className="text-8xl font-bold text-yellow-400 mb-2">
                {streakData.currentStreak}
              </div>
              <div className="text-xl text-white/80">
                Current Streak
              </div>
              {streakData.currentStreak > 0 && (
                <div className="text-6xl mt-4">🔥</div>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                <div className="text-4xl font-bold text-white mb-1">
                  {streakData.longestStreak}
                </div>
                <div className="text-sm text-white/60">
                  Longest Streak
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                <div className="text-4xl font-bold text-white mb-1">
                  {streakData.totalDays}
                </div>
                <div className="text-sm text-white/60">
                  Total Days
                </div>
              </div>
            </div>
            
            {streakData.lastRecordedDate && (
              <div className="text-center text-white/60 text-sm">
                Last recorded: {new Date(streakData.lastRecordedDate).toLocaleDateString()}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-white/60">
            Failed to load streak data
          </div>
        )}
        
        <div className="mt-12 text-center space-y-4">
          <a 
            href="/stats" 
            className="inline-block px-6 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-white hover:bg-white/30 transition-colors mr-4"
          >
            View Stats
          </a>
          <a 
            href="/" 
            className="inline-block px-6 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-white hover:bg-white/30 transition-colors"
          >
            ← Back to FriendScore
          </a>
        </div>
      </div>
    </div>
  )
}