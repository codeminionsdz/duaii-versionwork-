-- Create profile automatically when user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  user_role text;
begin
  -- Determine role from metadata
  user_role := coalesce(new.raw_user_meta_data ->> 'role', 'user');
  
  -- Create profile
  insert into public.profiles (id, full_name, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', 'مستخدم جديد'),
    coalesce(new.raw_user_meta_data ->> 'phone', null),
    user_role
  )
  on conflict (id) do nothing;
  
  return new;
end;
$$;

-- Trigger on auth.users insert
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
