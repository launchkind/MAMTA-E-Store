-- Migration 013: CMS Tables — layout config, page components, subscriptions

-- Add layout_settings and seller_config to base_config
alter table public.base_config
  add column if not exists layout_settings jsonb not null default '{}',
  add column if not exists seller_config   jsonb not null default '{}';

-- Extend component_types with missing columns
alter table public.component_types
  add column if not exists label     text,
  add column if not exists icon      text default 'component',
  add column if not exists structure jsonb not null default '{}',
  add column if not exists is_active boolean not null default true;

-- Page components table (website layout per page)
create table if not exists public.page_components (
  id             uuid primary key default uuid_generate_v4(),
  page_type      text not null,
  component_type text not null,
  title          text not null,
  description    text,
  weight         integer not null default 0,
  is_active      boolean not null default true,
  settings       jsonb not null default '{}',
  created_by     uuid references auth.users(id),
  updated_by     uuid references auth.users(id),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create trigger page_components_updated_at before update on public.page_components
  for each row execute procedure public.update_updated_at();

alter table public.page_components enable row level security;
create policy "page_components_public_read"  on public.page_components for select using (true);
create policy "page_components_admin_write"  on public.page_components for all    using (public.is_admin());

-- Newsletter subscriptions table
create table if not exists public.subscriptions (
  id          uuid primary key default uuid_generate_v4(),
  email       text not null unique,
  source      text default 'website',
  is_active   boolean not null default true,
  preferences jsonb not null default '{"newsletter": true, "promotions": true, "newProducts": true}',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger subscriptions_updated_at before update on public.subscriptions
  for each row execute procedure public.update_updated_at();

alter table public.subscriptions enable row level security;
create policy "subscriptions_insert_anon" on public.subscriptions for insert to anon, authenticated with check (true);
create policy "subscriptions_admin_read"  on public.subscriptions for select using (public.is_admin());
