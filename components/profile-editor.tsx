"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"

type Profile = {
  id: string
  username: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  location: string | null
  discord_user_id: string | null
  discord_connected_at: string | null
}

export function ProfileEditor({ profile, userId }: { profile: Profile | null; userId: string }) {
  const [displayName, setDisplayName] = useState(profile?.display_name || "")
  const [bio, setBio] = useState(profile?.bio || "")
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "")
  const [location, setLocation] = useState(profile?.location || "")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const router = useRouter()

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    const supabase = createClient()

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: displayName || null,
          bio: bio || null,
          avatar_url: avatarUrl || null,
          location: location || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)

      if (error) throw error

      setMessage({ type: "success", text: "Profile updated successfully!" })
      router.refresh()
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to update profile",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleConnectDiscord = async () => {
    const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID
    if (!clientId) {
      setMessage({ type: "error", text: "Discord integration not configured" })
      return
    }

    const redirectUri = encodeURIComponent(`${window.location.origin}/api/discord/callback`)
    const scope = encodeURIComponent("identify activities.read")
    const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`

    window.location.href = discordAuthUrl
  }

  const handleDisconnectDiscord = async () => {
    setIsLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          discord_user_id: null,
          discord_access_token: null,
          discord_refresh_token: null,
          discord_connected_at: null,
        })
        .eq("id", userId)

      if (error) throw error

      setMessage({ type: "success", text: "Discord disconnected successfully!" })
      router.refresh()
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to disconnect Discord",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
        <CardDescription>Customize how your profile appears to visitors</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" value={profile?.username || ""} disabled className="bg-muted" />
            <p className="text-xs text-muted-foreground">Your profile URL: dropss/{profile?.username}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              placeholder="Your Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              placeholder="Tell visitors about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="avatarUrl">Avatar URL</Label>
            <Input
              id="avatarUrl"
              type="url"
              placeholder="https://example.com/avatar.jpg"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="Los Angeles, California"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-sm font-semibold">Discord Rich Presence</h3>
            <p className="text-xs text-muted-foreground">
              Connect your Discord account to automatically display your live activity on your profile
            </p>

            {profile?.discord_user_id ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <div className="w-2 h-2 rounded-full bg-green-600" />
                  Discord Connected
                </div>
                <Button type="button" variant="outline" onClick={handleDisconnectDiscord} disabled={isLoading}>
                  Disconnect Discord
                </Button>
              </div>
            ) : (
              <Button type="button" variant="outline" onClick={handleConnectDiscord}>
                Connect Discord
              </Button>
            )}
          </div>

          {message && (
            <p className={`text-sm ${message.type === "success" ? "text-green-600" : "text-destructive"}`}>
              {message.text}
            </p>
          )}

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
