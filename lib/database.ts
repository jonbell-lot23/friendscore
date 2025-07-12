// Client-side database functions that call API routes

export async function getTodaysScore(): Promise<number | null> {
  try {
    const response = await fetch('/api/score')
    if (response.ok) {
      const data = await response.json()
      return data.score
    }
    return null
  } catch (error) {
    console.error('Error getting today\'s score:', error)
    return null
  }
}

export async function saveScore(score: number): Promise<boolean> {
  try {
    const response = await fetch('/api/score', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ score }),
    })
    
    return response.ok
  } catch (error) {
    console.error('Error saving score:', error)
    return false
  }
}