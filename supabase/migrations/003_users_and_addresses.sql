-- Migration 003: Users table (extends auth.users) and Addresses

-- Public user profile — auto-created when auth.users row is inserted
create table public.users (
  id            uuid references auth.users(id) on delete cascade primary key,
  name          text not null,
  email         text not null unique,
  avatar        text default 'https://res.cloudinary.com/dxkhdqifr/image/upload/v1767712291/user_hz2mcv.png',
  role          user_role not null default 'user',
  employee_role employee_role,
  auth_provider auth_provider not null default 'local',
  has_set_password boolean not null default true,
  email_verified   boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint employee_role_check check (
    (role = 'employee' and employee_role is not null) or
    (role != 'employee' and employee_role is null)
  )
);

-- Auto-create profile row when Supabase Auth creates a new user
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  provider_val text;
begin
  -- raw_user_meta_data->>'provider' is null for dashboard-created users → default 'local'
  provider_val := coalesce(
    new.raw_user_meta_data->>'provider',
    new.app_metadata->>'provider',
    'local'
  );

  insert into public.users (id, name, email, auth_provider, email_verified, has_set_password)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'name',
      new.raw_user_meta_data->>'full_name',
      split_part(new.email, '@', 1)
    ),
    new.email,
    provider_val::auth_provider,
    new.email_confirmed_at is not null,
    provider_val = 'local'
  )
  on conflict (id) do nothing;  -- safe to re-run; never error if row already exists

  return new;
exception when others then
  -- Log the error but never block the auth.users insert
  raise warning 'handle_new_user failed for %: %', new.email, sqlerrm;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create trigger users_updated_at before update on public.users
  for each row execute procedure public.update_updated_at();

-- RLS
alter table public.users enable row level security;

create policy "users_read_own_or_staff" on public.users
  for select using (auth.uid() = id or public.is_staff());

create policy "users_update_own" on public.users
  for update using (auth.uid() = id)
  with check (
    auth.uid() = id and
    role = (select role from public.users where id = auth.uid())
  );

create policy "users_admin_all" on public.users
  for all using (public.is_admin());

create policy "users_insert_trigger" on public.users
  for insert with check (true);

-- ─── Addresses ───────────────────────────────────────────────────────────────

create table public.addresses (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.users(id) on delete cascade,
  street      text not null,
  city        text not null,
  state       text not null,
  country     text not null,
  postal_code text not null,
  is_default  boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index idx_addresses_user_id on public.addresses(user_id);

-- Only one default address per user
create or replace function public.enforce_single_default_address()
returns trigger language plpgsql as $$
begin
  if new.is_default = true then
    update public.addresses
    set is_default = false
    where user_id = new.user_id and id != new.id;
  end if;
  return new;
end;
$$;

create trigger single_default_address
  before insert or update on public.addresses
  for each row when (new.is_default = true)
  execute procedure public.enforce_single_default_address();

create trigger addresses_updated_at before update on public.addresses
  for each row execute procedure public.update_updated_at();

-- RLS
alter table public.addresses enable row level security;

create policy "addresses_own" on public.addresses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "addresses_staff_read" on public.addresses
  for select using (public.is_staff());
