-- Add new columns for custom features to themes table
alter table public.themes
  add column if not exists cursor_url text,
  add column if not exists music_url text,
  add column if not exists name_effect text default 'none',
  add column if not exists rich_presence text;

-- name_effect options: 'none', 'gradient', 'glitch', 'wave', 'rainbow'
