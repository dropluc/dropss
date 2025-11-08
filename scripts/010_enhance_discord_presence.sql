-- Add enhanced Discord Rich Presence fields
alter table public.profiles
  add column if not exists discord_activity_type text, -- 'playing', 'listening', 'watching', 'custom'
  add column if not exists discord_activity_name text, -- Game/app name like "Roblox" or "Code"
  add column if not exists discord_activity_details text, -- Details like "Clipping Roblox" or "sleeping cuh"
  add column if not exists discord_activity_icon_url text; -- Game/app icon URL

comment on column public.profiles.discord_activity_type is 'Type of Discord activity: playing, listening, watching, custom';
comment on column public.profiles.discord_activity_name is 'Name of the activity (game, app, or custom status)';
comment on column public.profiles.discord_activity_details is 'Additional details about the activity';
comment on column public.profiles.discord_activity_icon_url is 'Icon URL for the game/app being used';
