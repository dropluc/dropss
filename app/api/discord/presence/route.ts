import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")
  const accessToken = searchParams.get("accessToken")

  if (!userId || !accessToken) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 })
  }

  try {
    // Fetch Discord user presence
    const userResponse = await fetch("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!userResponse.ok) {
      throw new Error("Failed to fetch Discord user")
    }

    const user = await userResponse.json()

    // Note: Discord's REST API doesn't provide presence data directly
    // For real presence data, you would need a Discord bot or Gateway connection
    // This is a simplified version that returns user info
    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        discriminator: user.discriminator,
        avatar: user.avatar
          ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
          : `https://cdn.discordapp.com/embed/avatars/${Number.parseInt(user.discriminator) % 5}.png`,
        status: "online",
        activities: [],
      },
    })
  } catch (error) {
    console.error("Discord presence fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch presence" }, { status: 500 })
  }
}
