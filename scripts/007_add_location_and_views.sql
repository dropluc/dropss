-- Add location field to profiles
alter table public.profiles add column if not exists location text;

-- Create profile views table for tracking
create table if not exists public.profile_views (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade,
  viewed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  viewer_ip text
);

-- Enable RLS
alter table public.profile_views enable row level security;

-- RLS Policies for profile_views
create policy "profile_views_select_own"
  on public.profile_views for select
  using (auth.uid() = profile_id);

create policy "profile_views_insert_all"
  on public.profile_views for insert
  with check (true);

-- Create index for faster view counts
create index profile_views_profile_id_idx on public.profile_views(profile_id);
