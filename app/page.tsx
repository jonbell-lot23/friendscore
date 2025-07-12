'use client'
import { useState, useRef, useEffect } from 'react'
import { getTodaysScore, saveScore } from '../lib/database'

export default function FriendScoreApp() {
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

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging || !containerRef.current) return
    
    const rect = containerRef.current.getBoundingClientRect()
    setDragPosition({ x: clientX - rect.left, y: clientY - rect.top })
    setScore(calculateScore(clientY, rect))
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
    e.preventDefault()
    handleMove(e.clientX, e.clientY)
  }

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
              <div className="w-32 h-32 rounded-full border-8 border-white/60"></div>
            ) : (
              <div 
                className={`text-8xl md:text-9xl font-bold ${
                  (isDragging ? score : finalScore) === 100 ? 'text-yellow-400' : 'text-white'
                }`} 
                style={{ fontFamily: 'Marker Felt' }}
              >
                {isDragging ? score : finalScore}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
