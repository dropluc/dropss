-- Add Discord connection to profiles table
alter table public.profiles
  add column if not exists discord_id text unique,
  add column if not exists discord_username text,
  add column if not exists discord_avatar text,
  add column if not exists discord_status text;

-- discord_status options: 'online', 'idle', 'dnd', 'offline'
