-- Create themes table
create table if not exists public.themes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  background_color text default '#ffffff',
  text_color text default '#000000',
  accent_color text default '#3b82f6',
  font_family text default 'sans-serif',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.themes enable row level security;

-- RLS Policies for themes
create policy "themes_select_own"
  on public.themes for select
  using (auth.uid() = user_id);

create policy "themes_select_by_profile"
  on public.themes for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.theme_id = themes.id
    )
  );

create policy "themes_insert_own"
  on public.themes for insert
  with check (auth.uid() = user_id);

create policy "themes_update_own"
  on public.themes for update
  using (auth.uid() = user_id);

create policy "themes_delete_own"
  on public.themes for delete
  using (auth.uid() = user_id);

-- Create index for user lookups
create index themes_user_id_idx on public.themes(user_id);
