-- Add foreign key constraint for theme_id in profiles
alter table public.profiles
  add constraint profiles_theme_id_fkey
  foreign key (theme_id)
  references public.themes(id)
  on delete set null;
