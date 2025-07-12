import { NextRequest } from 'next/server'

// In-memory store for cursor positions
const cursors = new Map<string, {
  x: number
  y: number
  color: string
  isDragging: boolean
  score?: number
  lastSeen: number
}>()

// Clean up old cursors every 30 seconds
setInterval(() => {
  const now = Date.now()
  cursors.forEach((cursor, userId) => {
    if (now - cursor.lastSeen > 30000) { // 30 seconds
      cursors.delete(userId)
    }
  })
}, 30000)

export async function POST(request: NextRequest) {
  try {
    const { userId, x, y, isDragging, score } = await request.json()
    
    if (!cursors.has(userId)) {
      // Assign random color to new user
      const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff']
      const color = colors[Math.floor(Math.random() * colors.length)]
      
      cursors.set(userId, {
        x, y, color, isDragging, score,
        lastSeen: Date.now()
      })
    } else {
      // Update existing user
      const cursor = cursors.get(userId)!
      cursors.set(userId, {
        ...cursor,
        x, y, isDragging, score,
        lastSeen: Date.now()
      })
    }
    
    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ error: 'Failed to update cursor' }, { status: 500 })
  }
}

export async function GET() {
  // Return all active cursors
  const activeCursors: any[] = []
  cursors.forEach((cursor, userId) => {
    activeCursors.push({
      userId,
      ...cursor
    })
  })
  
  return Response.json({ cursors: activeCursors })
}