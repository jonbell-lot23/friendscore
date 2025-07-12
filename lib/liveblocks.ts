import { createClient } from "@liveblocks/client"
import { createRoomContext } from "@liveblocks/react"

const client = createClient({
  // For now, we'll use the public key approach for development
  // In production, you'd want to use authentication
  publicApiKey: "pk_dev_friendscore", // This is a placeholder - Liveblocks will work without a real key for local dev
  
  // Throttle updates to 60fps max
  throttle: 16,
})

export type Presence = {
  cursor: { x: number; y: number } | null
  isDragging: boolean
  score?: number
}

export type Storage = {
  // We can add shared state here later if needed
}

export type UserMeta = {
  id: string
  info: {
    name: string
    color: string
  }
}

export type RoomEvent = {
  // Custom events can go here
}

export const {
  RoomProvider,
  useRoom,
  useMyPresence,
  useOthers,
  useBroadcastEvent,
  useEventListener,
} = createRoomContext<Presence, Storage, UserMeta, RoomEvent>(client)