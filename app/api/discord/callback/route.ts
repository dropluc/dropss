import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")

  if (!code) {
    return NextResponse.redirect(new URL("/dashboard?error=no_code", request.url))
  }

  try {
    const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID
    const clientSecret = process.env.DISCORD_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      throw new Error("Discord credentials not configured")
    }

    const redirectUri = `${new URL(request.url).origin}/api/discord/callback`

    // Exchange code for access token
    const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }),
    })

    if (!tokenResponse.ok) {
      throw new Error("Failed to exchange code for token")
    }

    const tokenData = await tokenResponse.json()
    const { access_token, refresh_token } = tokenData

    // Get Discord user info
    const userResponse = await fetch("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    })

    if (!userResponse.ok) {
      throw new Error("Failed to fetch Discord user info")
    }

    const discordUser = await userResponse.json()

    // Update profile with Discord connection
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("Not authenticated")
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        discord_user_id: discordUser.id,
        discord_access_token: access_token,
        discord_refresh_token: refresh_token,
        discord_connected_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (error) throw error

    return NextResponse.redirect(new URL("/dashboard?discord=connected", request.url))
  } catch (error) {
    console.error("Discord OAuth error:", error)
    return NextResponse.redirect(new URL("/dashboard?error=discord_failed", request.url))
  }
}
