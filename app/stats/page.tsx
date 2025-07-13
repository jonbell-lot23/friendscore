'use client'
import { useState, useEffect } from 'react'

interface ScoreData {
  date: string
  score: number
  created_at: string
  updated_at: string
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

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  
  if (isNaN(date.getTime())) return dateString
  
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffMinutes < 1) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes} minutes ago`
  if (diffHours < 24) return `${diffHours} hours ago`
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  return `${Math.floor(diffDays / 365)} years ago`
}

export default function StatsPage() {
  const [scores, setScores] = useState<ScoreData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/stats')
        if (response.ok) {
          const data = await response.json()
          setScores(data.scores)
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchStats()
  }, [])
  
  return (
    <div className="min-h-screen bg-emerald-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          FriendScore Stats
        </h1>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-white/20">
                <th className="px-6 py-3 text-left text-white font-semibold">Date</th>
                <th className="px-6 py-3 text-left text-white font-semibold">Score</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={2} className="px-6 py-8 text-center text-white/60">
                    Loading...
                  </td>
                </tr>
              ) : scores.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-6 py-8 text-center text-white/60">
                    No scores recorded yet
                  </td>
                </tr>
              ) : (
                scores.map((score) => (
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
                ))
              )}
            </tbody>
          </table>
        </div>
        
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