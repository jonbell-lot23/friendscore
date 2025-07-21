'use client'
import { useState, useEffect } from 'react'

interface ScoreData {
  date: string
  score: number
  created_at: string
  updated_at: string
}

interface ProgressData {
  totalScore: number
  averageScore: number
  currentStreak: number
  longestStreak: number
  totalDays: number
  perfectDays: number
  lastRecordedDate: string | null
  scores: ScoreData[]
}

function formatRelativeDate(dateString: string): string {
  const parts = dateString.split('-')
  if (parts.length !== 3) return dateString
  
  const year = parseInt(parts[0])
  const month = parseInt(parts[1]) - 1
  const day = parseInt(parts[2])
  
  if (isNaN(year) || isNaN(month) || isNaN(day)) return dateString
  
  const scoreDate = new Date(year, month, day)
  const now = new Date()
  const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const diffMs = nowDate.getTime() - scoreDate.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays === -1) return 'Tomorrow'
  if (diffDays < 0) return `In ${Math.abs(diffDays)} days`
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  return `${Math.floor(diffDays / 365)} years ago`
}

export default function ProgressPage() {
  const [progress, setProgress] = useState<ProgressData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProgress() {
      try {
        const response = await fetch('/api/progress')
        if (response.ok) {
          const data = await response.json()
          setProgress(data)
        }
      } catch (error) {
        console.error('Error fetching progress:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchProgress()
  }, [])
  
  return (
    <div className="min-h-screen bg-emerald-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold text-white mb-8 text-center">
          Your Progress
        </h1>
        
        {loading ? (
          <div className="text-center text-white/60 text-xl">
            Loading...
          </div>
        ) : progress ? (
          <>
            {/* Total Score Hero */}
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl p-8 mb-8 text-center shadow-xl">
              <div className="text-2xl text-white/90 mb-2">Total Score</div>
              <div className="text-8xl font-bold text-white">
                {progress.totalScore.toLocaleString()}
              </div>
              <div className="text-lg text-white/80 mt-2">
                Across {progress.totalDays} days
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              {/* Current Streak */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                <div className="text-5xl font-bold text-yellow-400 mb-1">
                  {progress.currentStreak}
                </div>
                <div className="text-sm text-white/60 mb-2">Current Streak</div>
                {progress.currentStreak > 0 && (
                  <div className="text-3xl">🔥</div>
                )}
              </div>

              {/* Perfect Days */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                <div className="text-5xl font-bold text-white mb-1">
                  {progress.perfectDays}
                </div>
                <div className="text-sm text-white/60 mb-2">Perfect Days</div>
                {progress.perfectDays > 0 && (
                  <div className="text-3xl">⭐</div>
                )}
              </div>

              {/* Longest Streak */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                <div className="text-5xl font-bold text-white mb-1">
                  {progress.longestStreak}
                </div>
                <div className="text-sm text-white/60">Longest Streak</div>
              </div>
            </div>

            {/* Score History */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-white/10">
                <h2 className="text-2xl font-semibold text-white">Score History</h2>
              </div>
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full">
                  <thead className="sticky top-0 bg-white/10">
                    <tr>
                      <th className="px-6 py-3 text-left text-white font-semibold">Date</th>
                      <th className="px-6 py-3 text-left text-white font-semibold">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {progress.scores.map((score) => (
                      <tr key={score.date} className="border-t border-white/10 hover:bg-white/5">
                        <td className="px-6 py-4 text-white">
                          {formatRelativeDate(score.date)}
                        </td>
                        <td className="px-6 py-4">
                          <span 
                            className={`text-2xl font-bold ${
                              score.score === 100 ? 'text-yellow-400' : 'text-white'
                            }`}
                          >
                            {score.score}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center text-white/60">
            No progress data available
          </div>
        )}
        
        <div className="mt-8 text-center">
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