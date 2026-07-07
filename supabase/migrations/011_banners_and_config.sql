-- Migration 011: Banners, Website Config, Social Media, Component Types

-- ─── Banners ──────────────────────────────────────────────────────────────────

create table public.banners (
  id         uuid primary key default uuid_generate_v4(),
  image      text not null,
  title      text,
  subtitle   text,
  link       text,
  is_active  boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ads_banners (
  id         uuid primary key default uuid_generate_v4(),
  image      text not null,
  title      text,
  link       text,
  position   text,
  is_active  boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_banners (
  id         uuid primary key default uuid_generate_v4(),
  product_id uuid references public.products(id) on delete set null,
  image      text not null,
  title      text,
  link       text,
  is_active  boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger banners_updated_at         before update on public.banners         for each row execute procedure public.update_updated_at();
create trigger ads_banners_updated_at     before update on public.ads_banners     for each row execute procedure public.update_updated_at();
create trigger product_banners_updated_at before update on public.product_banners for each row execute procedure public.update_updated_at();

alter table public.banners         enable row level security;
alter table public.ads_banners     enable row level security;
alter table public.product_banners enable row level security;

create policy "banners_public_read"         on public.banners         for select using (true);
create policy "banners_admin_write"         on public.banners         for all    using (public.is_admin());
create policy "ads_banners_public_read"     on public.ads_banners     for select using (true);
create policy "ads_banners_admin_write"     on public.ads_banners     for all    using (public.is_admin());
create policy "product_banners_public_read" on public.product_banners for select using (true);
create policy "product_banners_admin_write" on public.product_banners for all    using (public.is_admin());

-- ─── Website Config ───────────────────────────────────────────────────────────

create table public.website_config (
  id            uuid primary key default uuid_generate_v4(),
  store_name    text not null default 'Entry Store',
  tagline       text,
  logo          text,
  favicon       text,
  business_info jsonb default '{}',
  social_links  jsonb default '{}',
  addresses     jsonb default '[]',
  meta          jsonb default '{}',
  updated_at    timestamptz not null default now()
);

create table public.website_icons (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  url        text not null,
  type       text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.base_config (
  id                      uuid primary key default uuid_generate_v4(),
  tax_rate                numeric(5,2)  default 0,
  free_delivery_threshold numeric(12,2) default 0,
  platform_commission_pct numeric(5,2)  default 0,
  max_product_images      integer       default 5,
  default_user_image      text,
  updated_at              timestamptz not null default now()
);

create trigger website_icons_updated_at before update on public.website_icons for each row execute procedure public.update_updated_at();

alter table public.website_config enable row level security;
alter table public.website_icons  enable row level security;
alter table public.base_config    enable row level security;

create policy "website_config_public_read" on public.website_config for select using (true);
create policy "website_config_admin_write" on public.website_config for all    using (public.is_admin());
create policy "website_icons_public_read"  on public.website_icons  for select using (true);
create policy "website_icons_admin_write"  on public.website_icons  for all    using (public.is_admin());
create policy "base_config_public_read"    on public.base_config    for select using (true);
create policy "base_config_admin_write"    on public.base_config    for all    using (public.is_admin());

-- ─── Social Media ─────────────────────────────────────────────────────────────

create table public.social_media (
  id         uuid primary key default uuid_generate_v4(),
  platform   text not null,
  url        text,
  icon       text,
  is_active  boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger social_media_updated_at before update on public.social_media for each row execute procedure public.update_updated_at();

alter table public.social_media enable row level security;
create policy "social_media_public_read"  on public.social_media for select using (true);
create policy "social_media_admin_write"  on public.social_media for all    using (public.is_admin());

-- ─── Component Types ──────────────────────────────────────────────────────────

create table public.component_types (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  type        text not null unique,
  description text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger component_types_updated_at before update on public.component_types for each row execute procedure public.update_updated_at();

alter table public.component_types enable row level security;
create policy "component_types_public_read"  on public.component_types for select using (true);
create policy "component_types_admin_write"  on public.component_types for all    using (public.is_admin());

-- ─── Roles & Permissions (optional fine-grained RBAC) ────────────────────────

create table public.user_roles (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null unique,
  description text,
  created_at  timestamptz not null default now()
);

create table public.permissions (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null unique,
  resource    text not null,
  action      text not null,
  description text,
  created_at  timestamptz not null default now()
);

create table public.role_permissions (
  role_id       uuid not null references public.user_roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);

alter table public.user_roles       enable row level security;
alter table public.permissions      enable row level security;
alter table public.role_permissions enable row level security;

create policy "user_roles_admin_all"       on public.user_roles       for all using (public.is_admin());
create policy "permissions_admin_all"      on public.permissions      for all using (public.is_admin());
create policy "role_permissions_admin_all" on public.role_permissions for all using (public.is_admin());
create policy "user_roles_staff_read"      on public.user_roles       for select using (public.is_staff());
create policy "permissions_staff_read"     on public.permissions      for select using (public.is_staff());
