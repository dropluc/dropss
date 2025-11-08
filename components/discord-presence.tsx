"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type DiscordUser = {
  id: string
  username: string
  discriminator: string
  avatar: string
  status: "online" | "idle" | "dnd" | "offline"
  activities: Array<{
    type: number // 0 = Playing, 1 = Streaming, 2 = Listening, 3 = Watching, 4 = Custom
    name: string
    details?: string
    state?: string
    assets?: {
      large_image?: string
      large_text?: string
      small_image?: string
      small_text?: string
    }
  }>
}

type Profile = {
  discord_user_id: string | null
  discord_access_token: string | null
  username: string
}

export function DiscordPresence({ profile }: { profile: Profile }) {
  const [discordData, setDiscordData] = useState<DiscordUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!profile.discord_user_id || !profile.discord_access_token) {
      setIsLoading(false)
      return
    }

    const fetchDiscordPresence = async () => {
      try {
        const response = await fetch(
          `/api/discord/presence?userId=${profile.discord_user_id}&accessToken=${profile.discord_access_token}`,
        )

        if (!response.ok) {
          throw new Error("Failed to fetch Discord presence")
        }

        const data = await response.json()
        setDiscordData(data.user)
      } catch (error) {
        console.error("Error fetching Discord presence:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDiscordPresence()
    // Refresh presence every 30 seconds
    const interval = setInterval(fetchDiscordPresence, 30000)

    return () => clearInterval(interval)
  }, [profile.discord_user_id, profile.discord_access_token])

  if (isLoading || !discordData) {
    return null
  }

  const activity = discordData.activities[0]

  const getActivityTypeLabel = (type: number) => {
    switch (type) {
      case 0:
        return "Playing"
      case 1:
        return "Streaming"
      case 2:
        return "Listening to"
      case 3:
        return "Watching"
      case 4:
        return "Custom Status"
      default:
        return ""
    }
  }

  return (
    <div className="bg-[#232428] rounded-2xl p-4 border border-white/5 shadow-2xl">
      <div className="flex items-center gap-4">
        {/* Avatar with status indicator */}
        <div className="relative flex-shrink-0">
          <Avatar className="w-16 h-16 rounded-xl border-2 border-black/20">
            <AvatarImage src={discordData.avatar || "/placeholder.svg"} className="rounded-xl" />
            <AvatarFallback className="rounded-xl bg-[#5865f2] text-white">
              {discordData.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {/* Status indicator */}
          <div
            className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full border-[3px] border-[#232428] ${
              discordData.status === "online"
                ? "bg-[#23a559]"
                : discordData.status === "idle"
                  ? "bg-[#f0b232]"
                  : discordData.status === "dnd"
                    ? "bg-[#f23f43]"
                    : "bg-[#80848e]"
            }`}
          />
        </div>

        {/* Username and activity */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white text-base truncate">{discordData.username}</p>
          {activity ? (
            <div className="space-y-0.5">
              <p className="text-sm text-[#b5bac1] font-medium">
                {getActivityTypeLabel(activity.type)} <span className="font-semibold">{activity.name}</span>
              </p>
              {activity.details && <p className="text-xs text-[#80848e]">{activity.details}</p>}
              {activity.state && <p className="text-xs text-[#80848e]">{activity.state}</p>}
            </div>
          ) : (
            <p className="text-sm text-[#80848e]">last seen unknown</p>
          )}
        </div>

        {/* Activity icon */}
        {activity?.assets?.large_image && (
          <div className="flex-shrink-0">
            <img
              src={
                activity.assets.large_image.startsWith("mp:")
                  ? `https://media.discordapp.net/${activity.assets.large_image.slice(3)}`
                  : activity.assets.large_image
              }
              alt="Activity icon"
              className="w-14 h-14 rounded-lg"
            />
          </div>
        )}
      </div>
    </div>
  )
}
