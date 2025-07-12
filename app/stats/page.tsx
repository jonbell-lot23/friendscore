import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
})

function formatRelativeTime(date: string): string {
  const scoreDate = new Date(date + 'T00:00:00Z') // Treat as UTC to avoid timezone issues
  const now = new Date()
  const diffMs = now.getTime() - scoreDate.getTime()
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

async function getScoreStats() {
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
    
    return result.rows
  } catch (error) {
    console.error('Error fetching score stats:', error)
    return []
  }
}

export default async function StatsPage() {
  const scores = await getScoreStats()
  
  return (
    <div className="min-h-screen bg-emerald-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center" style={{ fontFamily: 'Marker Felt' }}>
          FriendScore Stats
        </h1>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-white/20">
                <th className="px-6 py-3 text-left text-white font-semibold">Date</th>
                <th className="px-6 py-3 text-left text-white font-semibold">Score</th>
                <th className="px-6 py-3 text-left text-white font-semibold">When</th>
                <th className="px-6 py-3 text-left text-white font-semibold">Last Modified</th>
              </tr>
            </thead>
            <tbody>
              {scores.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-white/60">
                    No scores recorded yet
                  </td>
                </tr>
              ) : (
                scores.map((score) => (
                  <tr key={score.date} className="border-t border-white/10 hover:bg-white/5">
                    <td className="px-6 py-4 text-white font-mono">
                      {score.date}
                    </td>
                    <td className="px-6 py-4">
                      <span 
                        className={`text-2xl font-bold ${
                          score.score === 100 ? 'text-yellow-400' : 'text-white'
                        }`}
                        style={{ fontFamily: 'Marker Felt' }}
                      >
                        {score.score}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-emerald-200">
                      {formatRelativeTime(score.date)}
                    </td>
                    <td className="px-6 py-4 text-white/60 text-sm">
                      {new Date(score.updated_at).toLocaleString('en-NZ', {
                        timeZone: 'Pacific/Auckland',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
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