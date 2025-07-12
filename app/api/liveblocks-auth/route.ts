import { Liveblocks } from "@liveblocks/node";
import { NextRequest } from "next/server";

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY!,
});

export async function POST(request: NextRequest) {
  // Get the current user from your database (for now, we'll create a random user)
  const user = {
    id: `user-${Math.random().toString(36).substr(2, 9)}`,
    info: {
      name: `User ${Math.floor(Math.random() * 1000)}`,
      color: "#" + Math.floor(Math.random()*16777215).toString(16)
    }
  };

  // Create a session for the current user
  const session = liveblocks.prepareSession(
    user.id,
    { userInfo: user.info }
  );

  // Give the user access to the room
  session.allow("friendscore-room", session.FULL_ACCESS);

  // Authorize the user and return the result
  const { status, body } = await session.authorize();
  return new Response(body, { status });
}