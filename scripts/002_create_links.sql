-- Create links table
create table if not exists public.links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  platform text not null,
  url text not null,
  display_order integer not null default 0,
  is_visible boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.links enable row level security;

-- RLS Policies for links
create policy "links_select_own"
  on public.links for select
  using (auth.uid() = user_id);

create policy "links_select_by_profile"
  on public.links for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = links.user_id
      and is_visible = true
    )
  );

create policy "links_insert_own"
  on public.links for insert
  with check (auth.uid() = user_id);

create policy "links_update_own"
  on public.links for update
  using (auth.uid() = user_id);

create policy "links_delete_own"
  on public.links for delete
  using (auth.uid() = user_id);

-- Create index for user lookups
create index links_user_id_idx on public.links(user_id);
