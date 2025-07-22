import { createClient } from "@liveblocks/client"
import { createRoomContext } from "@liveblocks/react"

const client = createClient({
  authEndpoint: "/api/liveblocks-auth",
  // Throttle updates to 60fps max
  throttle: 16,
})

export type Presence = {
  cursor: { x: number; y: number } | null
  isDragging: boolean
  score?: number
  lastUpdate?: number
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