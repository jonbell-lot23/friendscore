'use client'
import { useState, useRef, useEffect } from 'react'
import { getTodaysScore, saveScore } from '../lib/database'
import { RoomProvider, useMyPresence, useOthers } from '../lib/liveblocks'

function FriendScoreRoom() {
  const [myPresence, updateMyPresence] = useMyPresence()
  const others = useOthers()
  
  // Add error handling
  useEffect(() => {
    console.log('Liveblocks connected. Others:', others.length)
  }, [others.length])
  const [isDragging, setIsDragging] = useState(false)
  const [score, setScore] = useState(0)
  const [finalScore, setFinalScore] = useState<number | null>(null)

  // Load today's score on component mount
  useEffect(() => {
    async function loadTodaysScore() {
      const todaysScore = await getTodaysScore()
      if (todaysScore !== null) {
        setFinalScore(todaysScore)
      }
    }
    loadTodaysScore()
  }, [])
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  const calculateScore = (clientY: number, rect: DOMRect) => {
    const relativeY = clientY - rect.top
    const percentage = Math.max(0, Math.min(1, 1 - relativeY / rect.height))
    return Math.round(percentage * 100)
  }

  const handleStart = (clientX: number, clientY: number) => {
    if (!containerRef.current) return
    
    const rect = containerRef.current.getBoundingClientRect()
    setIsDragging(true)
    setFinalScore(null)
    setDragPosition({ x: clientX - rect.left, y: clientY - rect.top })
    setScore(calculateScore(clientY, rect))
  }

  const [overlapDuration, setOverlapDuration] = useState(0)
  const overlapStartTimeRef = useRef<number | null>(null)

  const handleMove = (clientX: number, clientY: number) => {
    if (!containerRef.current) return
    
    const rect = containerRef.current.getBoundingClientRect()
    const relativeX = clientX - rect.left
    const relativeY = clientY - rect.top
    
    if (isDragging) {
      setDragPosition({ x: relativeX, y: relativeY })
      setScore(calculateScore(clientY, rect))
    }
    
    // Update my presence with cursor position
    updateMyPresence({
      cursor: { x: relativeX / rect.width, y: relativeY / rect.height },
      isDragging,
      score: isDragging ? calculateScore(clientY, rect) : undefined
    })
    
    // No more blur effects - remove overlap tracking
    setOverlapDuration(0)
  }

  const handleEnd = async () => {
    if (!isDragging) return
    
    setIsDragging(false)
    setFinalScore(score)
    // Save score to database
    await saveScore(score)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault()
    const touch = e.touches[0]
    handleStart(touch.clientX, touch.clientY)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault()
    const touch = e.touches[0]
    handleMove(touch.clientX, touch.clientY)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    handleStart(e.clientX, e.clientY)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX, e.clientY)
  }

  // Handle mouse movement even when not dragging (for cursor sharing)
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        if (e.clientX >= rect.left && e.clientX <= rect.right && 
            e.clientY >= rect.top && e.clientY <= rect.bottom) {
          handleMove(e.clientX, e.clientY)
        }
      }
    }

    document.addEventListener('mousemove', handleGlobalMouseMove)
    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove)
    }
  }, [isDragging])

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handleMove(e.clientX, e.clientY)
      }
    }

    const handleGlobalMouseUp = () => {
      if (isDragging) {
        handleEnd()
      }
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove)
      document.addEventListener('mouseup', handleGlobalMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove)
      document.removeEventListener('mouseup', handleGlobalMouseUp)
    }
  }, [isDragging])

  const resetScore = async () => {
    setFinalScore(null)
    setScore(0)
    // Save 0 score to database to reset
    await saveScore(0)
  }

  return (
    <div className="min-h-screen bg-emerald-900 relative overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60"
        style={{
          backgroundImage: `url('/bamboo-1-bg.jpg')`,
        }}
      />
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-black/30" />
      
      <div 
        ref={containerRef}
        className="relative h-screen w-full touch-none select-none cursor-pointer"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleEnd}
      >

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            {!isDragging && finalScore === null ? (
              <div 
                className="w-32 h-32 rounded-full border-8 border-white/80"
              ></div>
            ) : (
              <div 
                className={`text-8xl md:text-9xl font-bold ${
                  (isDragging ? score : finalScore) === 100 ? 'text-yellow-400/90' : 'text-white/90'
                }`} 
                style={{ 
                  fontFamily: 'Marker Felt'
                }}
              >
                {isDragging ? score : finalScore}
              </div>
            )}
          </div>
        </div>


        {/* My cursor */}
        {myPresence.cursor && containerRef.current && (
          <div
            className="absolute pointer-events-none z-30 transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: myPresence.cursor.x * containerRef.current.getBoundingClientRect().width,
              top: myPresence.cursor.y * containerRef.current.getBoundingClientRect().height,
            }}
          >
            <div className="w-20 h-20 rounded-full bg-blue-400/80 shadow-lg"></div>
          </div>
        )}

        {/* Other users' cursors */}
        {others.map(({ connectionId, presence }) => {
          if (!containerRef.current || !presence.cursor) return null
          
          const rect = containerRef.current.getBoundingClientRect()
          const x = presence.cursor.x * rect.width
          const y = presence.cursor.y * rect.height
          
          return (
            <div
              key={connectionId}
              className="absolute pointer-events-none z-30 transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: x,
                top: y,
              }}
            >
              {/* Cursor dot */}
              <div className="w-20 h-20 rounded-full bg-white/80 shadow-lg"></div>
            </div>
          )
        })}

      </div>
    </div>
  )
}

export default function FriendScoreApp() {
  return (
    <RoomProvider 
      id="friendscore-room"
      initialPresence={{
        cursor: null,
        isDragging: false,
        score: undefined
      }}
    >
      <FriendScoreRoom />
    </RoomProvider>
  )
}
