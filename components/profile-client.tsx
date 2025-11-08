"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Volume2, VolumeX } from "lucide-react"

type Theme = {
  cursor_url: string | null
  music_url: string | null
  name_effect: string
} | null

export function ProfileClient({ theme }: { theme: Theme }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(30)
  const [showMusicControl, setShowMusicControl] = useState(false)
  const [showEntryScreen, setShowEntryScreen] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    console.log("[v0] ProfileClient mounted, showEntryScreen:", showEntryScreen)
    setMounted(true)
  }, [])

  useEffect(() => {
    // Apply custom cursor
    if (theme?.cursor_url) {
      console.log("[v0] Applying custom cursor:", theme.cursor_url)
      document.body.style.cursor = `url('${theme.cursor_url}'), auto`
    }

    if (theme?.music_url && audioRef.current) {
      console.log("[v0] Setting up background music:", theme.music_url)
      setShowMusicControl(true)
      audioRef.current.volume = volume / 100
      // Preload the audio
      audioRef.current.load()
    }

    // Apply name effects
    if (theme?.name_effect && theme.name_effect !== "none") {
      console.log("[v0] Applying name effect:", theme.name_effect)
      const nameElement = document.querySelector("[data-name-effect]")
      if (nameElement) {
        nameElement.classList.add(`name-effect-${theme.name_effect}`)
      }
    }

    return () => {
      // Cleanup
      if (theme?.cursor_url) {
        document.body.style.cursor = "auto"
      }
      const nameElement = document.querySelector("[data-name-effect]")
      if (nameElement && theme?.name_effect) {
        nameElement.classList.remove(`name-effect-${theme.name_effect}`)
      }
    }
  }, [theme, volume])

  const toggleMute = () => {
    if (audioRef.current) {
      const newMutedState = !isMuted
      audioRef.current.muted = newMutedState
      setIsMuted(newMutedState)
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(e.target.value)
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100
      if (newVolume > 0 && isMuted) {
        setIsMuted(false)
        audioRef.current.muted = false
      }
    }
  }

  const handleEnter = () => {
    console.log("[v0] Entry screen clicked, dismissing overlay")
    setShowEntryScreen(false)

    // Try to play audio after user interaction
    if (theme?.music_url && audioRef.current) {
      audioRef.current.play().catch((error) => {
        console.log("[v0] Auto-play failed:", error)
      })
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <>
      {showEntryScreen && (
        <div
          onClick={handleEnter}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-2xl cursor-pointer animate-in fade-in duration-300"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        >
          <div className="text-center space-y-4 select-none">
            <h2 className="text-5xl font-bold text-white tracking-wider animate-pulse drop-shadow-2xl">
              click to enter...
            </h2>
          </div>
        </div>
      )}

      {/* Background Music */}
      {theme?.music_url && (
        <>
          <audio ref={audioRef} loop preload="auto">
            <source src={theme.music_url} type="audio/mpeg" />
            <source src={theme.music_url} type="audio/mp3" />
            <source src={theme.music_url} type="audio/wav" />
            <source src={theme.music_url} type="audio/ogg" />
          </audio>

          {showMusicControl && (
            <div
              className="fixed top-6 left-6 z-50 bg-[#1e3a5f]/90 backdrop-blur-md rounded-full px-4 py-3 shadow-2xl border border-white/10 flex items-center gap-3 min-w-[200px] transition-opacity duration-300"
              style={{
                opacity: showEntryScreen ? 0.5 : 1,
                pointerEvents: showEntryScreen ? "none" : "auto",
              }}
            >
              <button
                onClick={toggleMute}
                className="text-white/90 hover:text-white transition-colors flex-shrink-0"
                aria-label={isMuted ? "Unmute music" : "Mute music"}
              >
                {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={handleVolumeChange}
                className="flex-1 h-1 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
                style={{
                  background: `linear-gradient(to right, white ${volume}%, rgba(255,255,255,0.2) ${volume}%)`,
                }}
              />
            </div>
          )}
        </>
      )}

      {/* Name Effect Styles */}
      <style jsx global>{`
        /* Gradient Effect */
        .name-effect-gradient {
          background: linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradient-shift 3s ease infinite;
        }

        @keyframes gradient-shift {
          0%, 100% { background-position: 0% center; }
          50% { background-position: 100% center; }
        }

        /* Glitch Effect */
        .name-effect-glitch {
          position: relative;
          animation: glitch-skew 1s infinite;
        }

        .name-effect-glitch::before,
        .name-effect-glitch::after {
          content: attr(data-name-effect);
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
        }

        .name-effect-glitch::before {
          animation: glitch-anim-1 0.5s infinite;
          clip-path: polygon(0 0, 100% 0, 100% 45%, 0 45%);
          transform: translate(-2px, -2px);
          opacity: 0.8;
        }

        .name-effect-glitch::after {
          animation: glitch-anim-2 0.7s infinite;
          clip-path: polygon(0 55%, 100% 55%, 100% 100%, 0 100%);
          transform: translate(2px, 2px);
          opacity: 0.8;
        }

        @keyframes glitch-anim-1 {
          0%, 100% { transform: translate(0); }
          33% { transform: translate(-2px, 2px); }
          66% { transform: translate(2px, -2px); }
        }

        @keyframes glitch-anim-2 {
          0%, 100% { transform: translate(0); }
          33% { transform: translate(2px, -2px); }
          66% { transform: translate(-2px, 2px); }
        }

        @keyframes glitch-skew {
          0%, 100% { transform: skew(0deg); }
          20% { transform: skew(-2deg); }
          40% { transform: skew(2deg); }
          60% { transform: skew(-1deg); }
          80% { transform: skew(1deg); }
        }

        /* Wave Effect */
        .name-effect-wave {
          animation: wave 2s ease-in-out infinite;
        }

        @keyframes wave {
          0%, 100% { transform: translateY(0px); }
          25% { transform: translateY(-5px); }
          75% { transform: translateY(5px); }
        }

        /* Rainbow Effect */
        .name-effect-rainbow {
          background: linear-gradient(
            90deg,
            #ff0000,
            #ff7f00,
            #ffff00,
            #00ff00,
            #0000ff,
            #4b0082,
            #9400d3
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: rainbow 3s linear infinite;
        }

        @keyframes rainbow {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
      `}</style>
    </>
  )
}
