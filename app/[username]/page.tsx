import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Eye, MapPin } from "lucide-react"
import type { Metadata } from "next"
import { ProfileClient } from "@/components/profile-client"
import { DiscordPresence } from "@/components/discord-presence"

type Props = {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params
  const reservedRoutes = ["dashboard", "auth", "api", "_next"]
  if (reservedRoutes.includes(username.toLowerCase())) {
    return {
      title: "dropss",
    }
  }
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, bio, username")
    .eq("username", username.toLowerCase())
    .maybeSingle()

  if (!profile) {
    return {
      title: "Profile Not Found - dropss",
    }
  }

  return {
    title: `${profile.display_name || profile.username} - dropss`,
    description: profile.bio || `Check out ${profile.display_name || profile.username}'s links`,
  }
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params
  const reservedRoutes = ["dashboard", "auth", "api", "_next"]
  if (reservedRoutes.includes(username.toLowerCase())) {
    notFound()
  }
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username.toLowerCase())
    .maybeSingle()

  if (!profile) {
    notFound()
  }

  await supabase.from("profile_views").insert({
    profile_id: profile.id,
  })

  const { count: viewCount } = await supabase
    .from("profile_views")
    .select("*", { count: "exact", head: true })
    .eq("profile_id", profile.id)

  const { data: links } = await supabase
    .from("links")
    .select("*")
    .eq("user_id", profile.id)
    .eq("is_visible", true)
    .order("display_order")

  const { data: theme } = await supabase.from("themes").select("*").eq("user_id", profile.id).maybeSingle()

  const themeStyles = theme
    ? {
        backgroundColor: theme.background_color,
        backgroundImage: theme.background_image_url
          ? `url(${theme.background_image_url})`
          : theme.background_color?.startsWith("http")
            ? `url(${theme.background_color})`
            : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        color: theme.text_color,
        fontFamily: theme.font_family,
      }
    : {
        backgroundColor: "#0f0f0f",
        color: "#ffffff",
        fontFamily: "sans-serif",
      }

  return (
    <>
      <ProfileClient theme={theme} />

      <div className="min-h-svh flex items-center justify-center p-6 relative" style={themeStyles}>
        {/* Blur overlay for background */}
        <div className="absolute inset-0 backdrop-blur-3xl bg-black/40" />

        <div className="relative z-10 w-full max-w-md space-y-6">
          {/* Profile Header - Centered */}
          <div className="flex flex-col items-center text-center space-y-4">
            <Avatar className="w-32 h-32 border-4 border-white/20 shadow-2xl">
              <AvatarImage src={profile.avatar_url || undefined} alt={profile.display_name || profile.username} />
              <AvatarFallback className="text-3xl">
                {(profile.display_name || profile.username).charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-2">
              <h1
                className="text-4xl font-bold text-white drop-shadow-lg"
                data-name-effect={theme?.name_effect || "none"}
              >
                {profile.display_name || profile.username}
              </h1>
              {profile.bio && <p className="text-lg text-white/90 text-balance max-w-sm">{profile.bio}</p>}
            </div>

            {/* Location */}
            {profile.location && (
              <div className="flex items-center gap-2 text-white/80">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{profile.location}</span>
              </div>
            )}
          </div>

          {/* Discord Rich Presence */}
          {profile.discord_user_id && <DiscordPresence profile={profile} />}

          {links && links.length > 0 && (
            <div className="flex justify-center gap-3 flex-wrap">
              {links.slice(0, 8).map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-14 h-14 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 hover:scale-110 transition-all flex items-center justify-center group shadow-lg"
                  title={link.platform}
                >
                  {getSocialIcon(link.platform)}
                </a>
              ))}
            </div>
          )}

          {/* View Counter */}
          {viewCount !== null && (
            <div className="flex items-center gap-2 text-white/60 text-sm justify-start">
              <Eye className="w-4 h-4" />
              <span>{viewCount}</span>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function getSocialIcon(platform: string) {
  const platformLower = platform.toLowerCase()

  const iconClass = "w-7 h-7 fill-white group-hover:scale-110 transition-transform"

  if (platformLower === "youtube") {
    return (
      <svg className={iconClass} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    )
  }

  if (platformLower === "twitter" || platformLower === "x") {
    return (
      <svg className={iconClass} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    )
  }

  if (platformLower === "instagram") {
    return (
      <svg className={iconClass} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-2.664-4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.072-4.358-.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.059 1.69-.073 4.949-.073zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.059 1.69-.073 4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    )
  }

  if (platformLower === "discord") {
    return (
      <svg className={iconClass} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026 13.83 13.83 0 0 0 1.226-1.963.074.074 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .084.009c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z" />
      </svg>
    )
  }

  if (platformLower === "twitch") {
    return (
      <svg className={iconClass} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    )
  }

  if (platformLower === "tiktok") {
    return (
      <svg className={iconClass} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
      </svg>
    )
  }

  if (platformLower === "github") {
    return (
      <svg className={iconClass} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.85 1.23 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
      </svg>
    )
  }

  if (platformLower === "linkedin") {
    return (
      <svg className={iconClass} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v11.452zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    )
  }

  if (platformLower === "spotify") {
    return (
      <svg className={iconClass} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm.12-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
      </svg>
    )
  }

  if (platformLower === "facebook") {
    return (
      <svg className={iconClass} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    )
  }

  // Default fallback icon
  return (
    <svg className={iconClass} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1s1.39-3.1 3.1-3.1zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />
    </svg>
  )
}
