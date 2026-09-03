-- BAS SHOP - Supabase setup
-- Run this whole file in Supabase SQL Editor.

-- PRODUCTS: keep the existing table and add missing columns.
alter table public.products add column if not exists name text;
alter table public.products add column if not exists price numeric;
alter table public.products add column if not exists stock integer;
alter table public.products add column if not exists image text;
alter table public.products add column if not exists description text;

alter table public.products enable row level security;

grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;

-- PROFILES
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  email text unique not null,
  role text not null default 'customer' check (role in ('customer','admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

grant select on public.profiles to authenticated;

-- Create a profile automatically when Supabase Auth creates a user.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.email
  )
  on conflict (id) do update
  set username = excluded.username,
      email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Username lookup functions.
create or replace function public.username_exists(p_username text)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where lower(username) = lower(p_username)
  );
$$;

create or replace function public.get_email_by_username(p_username text)
returns text
language sql
security definer
stable
set search_path = public
as $$
  select email
  from public.profiles
  where lower(username) = lower(p_username)
  limit 1;
$$;

revoke all on function public.username_exists(text) from public;
grant execute on function public.username_exists(text) to anon, authenticated;
revoke all on function public.get_email_by_username(text) from public;
grant execute on function public.get_email_by_username(text) to anon, authenticated;

-- Admin check.
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- Replace product policies safely.
drop policy if exists "Anyone can view products" on public.products;
drop policy if exists "Admins can insert products" on public.products;
drop policy if exists "Admins can update products" on public.products;
drop policy if exists "Admins can delete products" on public.products;

create policy "Anyone can view products"
on public.products for select
to anon, authenticated
using (true);

create policy "Admins can insert products"
on public.products for insert
to authenticated
with check (public.is_admin());

create policy "Admins can update products"
on public.products for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Admins can delete products"
on public.products for delete
to authenticated
using (public.is_admin());

-- Profile policy: a user can read only their own profile.
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
on public.profiles for select
to authenticated
using (id = auth.uid());
