import { useEffect, useState, useRef } from 'react'

interface CursorData {
  userId: string
  x: number
  y: number
  color: string
  isDragging: boolean
  score?: number
}

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false)
  const [otherCursors, setOtherCursors] = useState<Map<string, CursorData>>(new Map())
  const userIdRef = useRef<string>()

  useEffect(() => {
    // Generate unique user ID
    if (!userIdRef.current) {
      userIdRef.current = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }

    setIsConnected(true)

    // Poll for other cursors every 500ms
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch('/api/cursors')
        if (response.ok) {
          const data = await response.json()
          const cursorsMap = new Map<string, CursorData>()
          
          data.cursors.forEach((cursor: CursorData) => {
            // Don't include our own cursor
            if (cursor.userId !== userIdRef.current) {
              cursorsMap.set(cursor.userId, cursor)
            }
          })
          
          setOtherCursors(cursorsMap)
        }
      } catch (error) {
        console.error('Failed to fetch cursors:', error)
      }
    }, 500)

    return () => {
      clearInterval(pollInterval)
    }
  }, [])

  const broadcastCursor = async (cursorData: { x: number; y: number; isDragging: boolean; score?: number }) => {
    if (!userIdRef.current) return

    try {
      await fetch('/api/cursors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userIdRef.current,
          ...cursorData
        }),
      })
    } catch (error) {
      console.error('Failed to broadcast cursor:', error)
    }
  }

  return {
    isConnected,
    otherCursors,
    broadcastCursor
  }
}