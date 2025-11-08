-- Create function to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Create default theme first
  insert into public.themes (user_id)
  values (new.id);

  -- Create profile with metadata from signup
  insert into public.profiles (
    id,
    username,
    display_name,
    bio
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', 'user_' || substring(new.id::text from 1 for 8)),
    coalesce(new.raw_user_meta_data ->> 'display_name', null),
    coalesce(new.raw_user_meta_data ->> 'bio', null)
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- Drop existing trigger if it exists
drop trigger if exists on_auth_user_created on auth.users;

-- Create trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
