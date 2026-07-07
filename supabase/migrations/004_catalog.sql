-- Migration 004: Brands, Product Types, Categories

-- ─── Brands ──────────────────────────────────────────────────────────────────

create table public.brands (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null unique,
  image      text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger brands_updated_at before update on public.brands
  for each row execute procedure public.update_updated_at();

alter table public.brands enable row level security;
create policy "brands_public_read" on public.brands for select using (true);
create policy "brands_admin_write" on public.brands for all using (public.is_admin());

-- ─── Product Types ────────────────────────────────────────────────────────────

create table public.product_types (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  type          text not null unique,
  description   text,
  banner_images text[] default '{}',
  icon          text,
  color         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger product_types_updated_at before update on public.product_types
  for each row execute procedure public.update_updated_at();

alter table public.product_types enable row level security;
create policy "product_types_public_read" on public.product_types for select using (true);
create policy "product_types_admin_write" on public.product_types for all using (public.is_admin());

-- ─── Categories ───────────────────────────────────────────────────────────────

create table public.categories (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  slug          text unique,
  image         text,
  icon_image    text,
  category_type category_type[],
  parent_id     uuid references public.categories(id) on delete restrict,
  path          text not null default '',
  level         integer not null default 0,
  sort_order    integer not null default 0,
  is_active     boolean not null default true,
  description   text default '',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_categories_parent_id on public.categories(parent_id, sort_order);
create index idx_categories_path on public.categories(path);
create index idx_categories_is_active on public.categories(is_active);
create index idx_categories_slug on public.categories(slug);

-- Auto-generate slug from name
create or replace function public.generate_category_slug()
returns trigger language plpgsql as $$
declare
  base_slug  text;
  final_slug text;
  counter    integer := 1;
begin
  if new.slug is null or new.slug = '' then
    base_slug  := trim(both '-' from lower(regexp_replace(new.name, '[^a-z0-9]+', '-', 'gi')));
    final_slug := base_slug;
    while exists (select 1 from public.categories where slug = final_slug and id != new.id) loop
      final_slug := base_slug || '-' || counter;
      counter    := counter + 1;
    end loop;
    new.slug := final_slug;
  end if;
  return new;
end;
$$;

create trigger category_slug_trigger
  before insert or update on public.categories
  for each row execute procedure public.generate_category_slug();

-- Set path and level from parent
create or replace function public.set_category_path()
returns trigger language plpgsql as $$
declare
  parent_rec record;
begin
  if new.parent_id is not null then
    select path, level into parent_rec from public.categories where id = new.parent_id;
    new.path  := case when parent_rec.path = '' then new.parent_id::text
                      else parent_rec.path || ',' || new.parent_id::text end;
    new.level := parent_rec.level + 1;
  else
    new.path  := '';
    new.level := 0;
  end if;
  return new;
end;
$$;

create trigger category_path_trigger
  before insert or update of parent_id on public.categories
  for each row execute procedure public.set_category_path();

create trigger categories_updated_at before update on public.categories
  for each row execute procedure public.update_updated_at();

alter table public.categories enable row level security;
create policy "categories_public_read"  on public.categories for select using (true);
create policy "categories_admin_write"  on public.categories for all using (public.is_admin());
