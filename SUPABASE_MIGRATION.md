# Supabase Migration Plan — MAMTA E-STORE

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [What Changes vs What Stays](#2-what-changes-vs-what-stays)
3. [Phase 1 — PostgreSQL Database Schema](#3-phase-1--postgresql-database-schema)
4. [Phase 2 — Supabase Auth](#4-phase-2--supabase-auth)
5. [Phase 3 — Row Level Security (RLS)](#5-phase-3--row-level-security-rls)
6. [Phase 4 — Edge Functions (Complex Logic)](#6-phase-4--edge-functions-complex-logic)
7. [Phase 5 — Web App Migration (apps/web)](#7-phase-5--web-app-migration-appsweb)
8. [Phase 6 — Admin App Migration (apps/admin)](#8-phase-6--admin-app-migration-appsadmin)
9. [Phase 7 — Data Migration Scripts](#9-phase-7--data-migration-scripts)
10. [Environment Variables](#10-environment-variables)
11. [Execution Checklist](#11-execution-checklist)

---

## 1. Architecture Overview

### Current Architecture
```
Browser / Mobile
      │
      ▼
apps/web (Next.js)  ◄──────►  apps/admin (Vite/React)
      │                               │
      └──────────────┬────────────────┘
                     ▼
              apps/api (Express.js)
                     │
            ┌────────┴──────────┐
            ▼                   ▼
        MongoDB           Firebase Auth
       (Mongoose)         (OAuth only)
```

### Target Architecture (After Migration)
```
Browser / Mobile
      │
      ▼
apps/web (Next.js)  ◄──────►  apps/admin (Vite/React)
      │                               │
      └──────────────┬────────────────┘
                     │
         ┌───────────┴────────────┐
         ▼                        ▼
  Supabase Client SDK      Supabase Edge Functions
  (direct DB + auth)       (complex business logic)
         │
         ▼
   Supabase Platform
   ├── PostgreSQL (database)
   ├── Auth (users + OAuth)
   ├── Storage (optional - or keep Cloudinary)
   └── Realtime (optional - order tracking)
```

### Key Mindset Shift
| Old thinking | New thinking |
|---|---|
| Frontend → Express API → MongoDB | Frontend → Supabase SDK directly |
| JWT middleware for auth | Supabase session tokens, RLS enforces access |
| Controllers handle business logic | Simple ops: SDK; Complex ops: Edge Functions |
| Mongoose models define schema | SQL schema + Supabase types |

---

## 2. What Changes vs What Stays

### What Gets Replaced
| Current | Replacement |
|---|---|
| `apps/api` Express server | Supabase Edge Functions (only for complex logic) |
| MongoDB + Mongoose (25 models) | Supabase PostgreSQL (25 tables) |
| JWT auth (`authMiddleware.ts`) | Supabase Auth sessions |
| Firebase Auth (OAuth) | Supabase Auth OAuth providers |
| Express middleware (protect, admin, etc.) | Supabase RLS policies |
| `authController.ts` (login/register/reset) | Supabase Auth SDK methods |
| All CRUD controllers | Supabase JS client from frontend |

### What Stays Exactly the Same
| Item | Reason |
|---|---|
| `apps/web` Next.js structure | Only API calls change, not component architecture |
| `apps/admin` Vite/React structure | Same — only API calls change |
| `packages/ui` Shadcn components | No change |
| `packages/config` | No change |
| `packages/types` | Minor updates to reflect Supabase types |
| Stripe payment flow | Webhook target URL changes, logic stays |
| SSLCommerz payment flow | Same as Stripe |
| Cloudinary / ImageKit / S3 uploads | Keep as-is (no reason to migrate to Supabase Storage) |
| Nodemailer (custom emails) | Keep for order emails; Supabase handles auth emails |
| Turborepo + pnpm setup | No change |
| Recharts analytics UI | No change |
| Zustand state management | No change |

### The `apps/api` Folder
The Express server will be **replaced gradually**. Approach:
- Delete all CRUD controllers and routes that map 1:1 to Supabase table operations
- Keep the folder alive only for **Edge Functions** that handle:
  - Stripe webhook processing
  - SSLCommerz payment callbacks
  - Complex order workflow transitions
  - Email sending (Nodemailer)
  - Image upload signing (Cloudinary/ImageKit)
  - Analytics aggregation queries

---

## 3. Phase 1 — PostgreSQL Database Schema

### Setup Steps
1. Create a new Supabase project at supabase.com
2. Go to SQL Editor
3. Run the SQL blocks below in order (they have dependencies)

---

### 3.1 Enable Extensions
```sql
-- Run first
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm"; -- for text search on products
```

---

### 3.2 Enums
```sql
create type user_role as enum ('admin', 'user', 'employee', 'seller');
create type employee_role as enum ('packer', 'deliveryman', 'accounts', 'incharge', 'call_center');
create type auth_provider as enum ('local', 'google', 'github');
create type approval_status as enum ('pending', 'approved', 'rejected');
create type order_status as enum (
  'pending', 'address_confirmed', 'confirmed',
  'packed', 'delivering', 'delivered', 'completed', 'cancelled'
);
create type payment_status as enum ('pending', 'paid', 'failed', 'refunded', 'cod_collected');
create type payment_method as enum ('stripe', 'sslcommerz', 'cod');
create type cash_collection_status as enum ('collected', 'submitted', 'confirmed');
create type purchase_status as enum ('requisition', 'approved', 'purchased', 'received', 'cancelled');
create type seller_status as enum ('pending', 'approved', 'rejected');
create type category_type as enum ('Featured', 'Hot Categories', 'Top Categories');
create type notification_type as enum (
  'order_placed', 'order_confirmed', 'order_packed',
  'order_delivering', 'order_delivered', 'order_completed',
  'order_cancelled', 'payment_success', 'payment_failed',
  'general', 'promotion'
);
create type notification_priority as enum ('low', 'normal', 'high', 'urgent');
```

---

### 3.3 Users Table (extends Supabase auth.users)
```sql
-- Supabase Auth manages auth.users automatically
-- We create a public profile table that mirrors and extends it

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

-- Auto-create profile row when a new auth user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, name, email, auth_provider, email_verified, has_set_password)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'provider', 'local')::auth_provider,
    new.email_confirmed_at is not null,
    new.raw_user_meta_data->>'provider' is null -- local users have set password by default
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-update updated_at
create or replace function public.update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_updated_at before update on public.users
  for each row execute procedure public.update_updated_at();
```

---

### 3.4 Addresses Table
```sql
-- Separate table (was embedded array in MongoDB User model)
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

-- Trigger: only one default address per user
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
```

---

### 3.5 Brands Table
```sql
create table public.brands (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null unique,
  image      text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger brands_updated_at before update on public.brands
  for each row execute procedure public.update_updated_at();
```

---

### 3.6 Product Types Table
```sql
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
```

---

### 3.7 Categories Table (self-referential hierarchy)
```sql
create table public.categories (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  slug          text unique,
  image         text,
  icon_image    text,
  category_type category_type[],
  parent_id     uuid references public.categories(id) on delete restrict,
  path          text not null default '',    -- materialized path e.g. "uuid1,uuid2"
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

-- Trigger: auto-generate slug from name
create or replace function public.generate_category_slug()
returns trigger language plpgsql as $$
declare
  base_slug text;
  final_slug text;
  counter integer := 1;
begin
  if new.slug is null or new.slug = '' then
    base_slug := lower(regexp_replace(new.name, '[^a-z0-9]+', '-', 'gi'));
    base_slug := trim(both '-' from base_slug);
    final_slug := base_slug;
    while exists (select 1 from public.categories where slug = final_slug and id != new.id) loop
      final_slug := base_slug || '-' || counter;
      counter := counter + 1;
    end loop;
    new.slug := final_slug;
  end if;
  return new;
end;
$$;

create trigger category_slug_trigger
  before insert or update on public.categories
  for each row execute procedure public.generate_category_slug();

-- Trigger: set path and level from parent
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
```

---

### 3.8 Sellers Table
```sql
create table public.sellers (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null unique references public.users(id) on delete cascade,
  store_name    text not null unique,
  description   text not null,
  logo          text,
  status        seller_status not null default 'pending',
  contact_email text not null,
  contact_phone text,
  street        text,
  city          text,
  state         text,
  country       text,
  postal_code   text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_sellers_user_id on public.sellers(user_id);
create index idx_sellers_status on public.sellers(status);

create trigger sellers_updated_at before update on public.sellers
  for each row execute procedure public.update_updated_at();
```

---

### 3.9 Products Table
```sql
create table public.products (
  id                  uuid primary key default uuid_generate_v4(),
  name                text not null unique,
  slug                text unique,
  description         text not null,
  about_items         text[] default '{}',
  price               numeric(12,2) not null default 0,
  purchase_price      numeric(12,2) not null default 0,
  profit_margin       numeric(5,2) default 0 check (profit_margin >= 0 and profit_margin <= 100),
  discount_percentage numeric(5,2) default 0 check (discount_percentage >= 0 and discount_percentage <= 100),
  stock               integer not null default 0 check (stock >= 0),
  sold                integer not null default 0 check (sold >= 0),
  average_rating      numeric(3,2) default 0,
  num_reviews         integer not null default 0,
  view_count          integer not null default 0,
  image               text not null,
  images              text[] default '{}',
  category_id         uuid not null references public.categories(id),
  brand_id            uuid not null references public.brands(id),
  seller_id           uuid references public.sellers(id) on delete set null,
  approval_status     approval_status not null default 'approved',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- Junction table: product ↔ product_types (many-to-many)
create table public.product_product_types (
  product_id      uuid not null references public.products(id) on delete cascade,
  product_type_id uuid not null references public.product_types(id) on delete cascade,
  primary key (product_id, product_type_id)
);

create index idx_products_category_id on public.products(category_id);
create index idx_products_brand_id on public.products(brand_id);
create index idx_products_seller_id on public.products(seller_id);
create index idx_products_approval_status on public.products(approval_status);
create index idx_products_slug on public.products(slug);
create index idx_products_name_trgm on public.products using gin(name gin_trgm_ops);

-- Auto-generate slug
create or replace function public.generate_product_slug()
returns trigger language plpgsql as $$
declare
  base_slug text;
  final_slug text;
  counter integer := 1;
begin
  if new.slug is null or new.slug = '' or (tg_op = 'UPDATE' and new.name != old.name) then
    base_slug := lower(regexp_replace(new.name, '[^a-z0-9]+', '-', 'gi'));
    base_slug := trim(both '-' from base_slug);
    final_slug := base_slug;
    while exists (select 1 from public.products where slug = final_slug and id != new.id) loop
      final_slug := base_slug || '-' || counter;
      counter := counter + 1;
    end loop;
    new.slug := final_slug;
  end if;
  -- Keep image and images in sync
  if array_length(new.images, 1) > 0 then
    new.image := new.images[1];
  elsif new.image is not null then
    new.images := array[new.image];
  end if;
  return new;
end;
$$;

create trigger product_slug_trigger
  before insert or update on public.products
  for each row execute procedure public.generate_product_slug();

create trigger products_updated_at before update on public.products
  for each row execute procedure public.update_updated_at();
```

---

### 3.10 Product Reviews & Ratings Tables
```sql
create table public.product_reviews (
  id          uuid primary key default uuid_generate_v4(),
  product_id  uuid not null references public.products(id) on delete cascade,
  user_id     uuid not null references public.users(id) on delete cascade,
  user_name   text not null,
  rating      integer not null check (rating >= 1 and rating <= 5),
  comment     text not null,
  is_approved boolean not null default false,
  created_at  timestamptz not null default now(),
  unique(product_id, user_id)
);

create table public.product_ratings (
  product_id uuid not null references public.products(id) on delete cascade,
  user_id    uuid not null references public.users(id) on delete cascade,
  rating     integer not null check (rating >= 1 and rating <= 5),
  created_at timestamptz not null default now(),
  primary key (product_id, user_id)
);

create table public.product_views (
  id         uuid primary key default uuid_generate_v4(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id    uuid references public.users(id) on delete set null,
  viewed_at  timestamptz not null default now()
);

create index idx_product_reviews_product_id on public.product_reviews(product_id);
create index idx_product_reviews_is_approved on public.product_reviews(is_approved);
create index idx_product_views_product_id on public.product_views(product_id);

-- Trigger: recalculate average_rating and num_reviews after review changes
create or replace function public.update_product_rating_stats()
returns trigger language plpgsql as $$
declare
  avg_r numeric;
  cnt   integer;
begin
  select coalesce(avg(rating), 0), count(*)
    into avg_r, cnt
    from public.product_reviews
   where product_id = coalesce(new.product_id, old.product_id)
     and is_approved = true;

  update public.products
     set average_rating = round(avg_r, 2), num_reviews = cnt
   where id = coalesce(new.product_id, old.product_id);

  return coalesce(new, old);
end;
$$;

create trigger product_rating_update
  after insert or update or delete on public.product_reviews
  for each row execute procedure public.update_product_rating_stats();
```

---

### 3.11 Cart & Wishlist Tables
```sql
-- Cart (was embedded in User model)
create table public.cart_items (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity   integer not null default 1 check (quantity >= 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, product_id)
);

-- Wishlist (was embedded array in User model)
create table public.wishlist_items (
  user_id    uuid not null references public.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create index idx_cart_items_user_id on public.cart_items(user_id);
create index idx_wishlist_items_user_id on public.wishlist_items(user_id);

create trigger cart_items_updated_at before update on public.cart_items
  for each row execute procedure public.update_updated_at();
```

---

### 3.12 Orders Table
```sql
create table public.orders (
  id                   uuid primary key default uuid_generate_v4(),
  user_id              uuid not null references public.users(id),
  total                numeric(12,2) not null default 0,
  status               order_status not null default 'pending',
  payment_status       payment_status not null default 'pending',
  payment_method       payment_method not null default 'stripe',

  -- Shipping address (snapshot at order time)
  shipping_street      text not null,
  shipping_city        text not null,
  shipping_state       text not null,
  shipping_country     text not null,
  shipping_postal_code text not null,

  -- Stripe payment info
  stripe_payment_intent_id text,
  stripe_session_id        text,
  stripe_payment_method    text,
  stripe_card_brand        text,
  stripe_card_last4        text,
  stripe_receipt_url       text,
  stripe_charge_id         text,

  -- SSLCommerz payment info
  ssl_transaction_id    text,
  ssl_validation_id     text,
  ssl_bank_tran_id      text,
  ssl_card_type         text,
  ssl_card_issuer       text,
  ssl_card_brand        text,
  ssl_payment_method    text,
  ssl_mobile_provider   text,
  ssl_amount            numeric(12,2),
  ssl_currency          text,

  -- Common payment tracking
  paid_amount  numeric(12,2),
  currency     text default 'BDT',
  paid_at      timestamptz,

  -- COD tracking
  cod_amount       numeric(12,2) default 0,
  cod_collected_at timestamptz,
  cod_collected_by uuid references public.users(id),
  cod_returned_at  timestamptz,
  cod_returned_to  uuid references public.users(id),

  -- Employee assignments
  assigned_packer      uuid references public.users(id),
  assigned_deliveryman uuid references public.users(id),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_orders_user_id on public.orders(user_id);
create index idx_orders_status on public.orders(status);
create index idx_orders_payment_status on public.orders(payment_status);
create index idx_orders_created_at on public.orders(created_at desc);

create trigger orders_updated_at before update on public.orders
  for each row execute procedure public.update_updated_at();
```

---

### 3.13 Order Items Table
```sql
create table public.order_items (
  id         uuid primary key default uuid_generate_v4(),
  order_id   uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  seller_id  uuid references public.sellers(id) on delete set null,
  name       text not null,
  price      numeric(12,2) not null,
  quantity   integer not null check (quantity >= 1),
  image      text
);

create index idx_order_items_order_id on public.order_items(order_id);
```

---

### 3.14 Order Status History Table
```sql
-- Replaces the status_history embedded array and status_updates object in MongoDB
create table public.order_status_history (
  id           uuid primary key default uuid_generate_v4(),
  order_id     uuid not null references public.orders(id) on delete cascade,
  status       order_status not null,
  changed_by   uuid not null references public.users(id),
  changed_by_name text not null,
  notes        text default '',
  changed_at   timestamptz not null default now()
);

create index idx_order_status_history_order_id on public.order_status_history(order_id);
```

---

### 3.15 Cash Collections Table
```sql
create table public.cash_collections (
  id                    uuid primary key default uuid_generate_v4(),
  order_id              uuid not null references public.orders(id),
  amount                numeric(12,2) not null,
  collected_by          uuid not null references public.users(id),
  collected_at          timestamptz not null default now(),
  submitted_to_accounts uuid references public.users(id),
  submitted_at          timestamptz,
  confirmed_by_accounts uuid references public.users(id),
  confirmed_at          timestamptz,
  status                cash_collection_status not null default 'collected',
  notes                 text default '',
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index idx_cash_collections_collected_by on public.cash_collections(collected_by, status);
create index idx_cash_collections_order_id on public.cash_collections(order_id);

create trigger cash_collections_updated_at before update on public.cash_collections
  for each row execute procedure public.update_updated_at();
```

---

### 3.16 Suppliers Table
```sql
create table public.suppliers (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  contact       text,
  email         text,
  phone         text,
  address       text,
  notes         text default '',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger suppliers_updated_at before update on public.suppliers
  for each row execute procedure public.update_updated_at();
```

---

### 3.17 Purchases Table
```sql
create table public.purchases (
  id                     uuid primary key default uuid_generate_v4(),
  purchase_number        text not null unique,
  status                 purchase_status not null default 'requisition',
  total_amount           numeric(12,2) not null default 0,
  supplier_id            uuid references public.suppliers(id) on delete set null,
  supplier_name          text not null,
  supplier_contact       text,
  supplier_email         text,
  supplier_address       text,
  notes                  text default '',
  created_by             uuid not null references public.users(id),
  created_by_name        text not null,
  approved_by            uuid references public.users(id),
  approved_by_name       text,
  approved_at            timestamptz,
  approved_notes         text,
  purchased_by           uuid references public.users(id),
  purchased_by_name      text,
  purchased_at           timestamptz,
  purchased_notes        text,
  received_by            uuid references public.users(id),
  received_by_name       text,
  received_at            timestamptz,
  received_notes         text,
  expected_delivery_date timestamptz,
  actual_delivery_date   timestamptz,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

-- Purchase number auto-generation
create or replace function public.generate_purchase_number()
returns trigger language plpgsql as $$
declare
  cnt integer;
begin
  if new.purchase_number is null or new.purchase_number = '' then
    select count(*) + 1 into cnt from public.purchases;
    new.purchase_number := 'PO-' || lpad(cnt::text, 6, '0');
  end if;
  return new;
end;
$$;

create trigger purchase_number_trigger
  before insert on public.purchases
  for each row execute procedure public.generate_purchase_number();

create trigger purchases_updated_at before update on public.purchases
  for each row execute procedure public.update_updated_at();
```

---

### 3.18 Purchase Items Table
```sql
create table public.purchase_items (
  id             uuid primary key default uuid_generate_v4(),
  purchase_id    uuid not null references public.purchases(id) on delete cascade,
  product_id     uuid not null references public.products(id),
  product_name   text not null,
  quantity       integer not null check (quantity >= 1),
  purchase_price numeric(12,2) not null check (purchase_price >= 0),
  profit_margin  numeric(5,2) not null default 0 check (profit_margin >= 0 and profit_margin <= 100),
  selling_price  numeric(12,2) not null check (selling_price >= 0),
  total_cost     numeric(12,2) not null check (total_cost >= 0)
);

create index idx_purchase_items_purchase_id on public.purchase_items(purchase_id);

-- Trigger: recalculate purchase total_amount when items change
create or replace function public.update_purchase_total()
returns trigger language plpgsql as $$
declare
  pid uuid;
begin
  pid := coalesce(new.purchase_id, old.purchase_id);
  update public.purchases
     set total_amount = (select coalesce(sum(total_cost), 0) from public.purchase_items where purchase_id = pid)
   where id = pid;
  return coalesce(new, old);
end;
$$;

create trigger purchase_total_trigger
  after insert or update or delete on public.purchase_items
  for each row execute procedure public.update_purchase_total();
```

---

### 3.19 Purchase Status History Table
```sql
create table public.purchase_status_history (
  id              uuid primary key default uuid_generate_v4(),
  purchase_id     uuid not null references public.purchases(id) on delete cascade,
  status          purchase_status not null,
  changed_by      uuid not null references public.users(id),
  changed_by_name text not null,
  notes           text default '',
  changed_at      timestamptz not null default now()
);
```

---

### 3.20 Notifications Table
```sql
create table public.notifications (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.users(id) on delete cascade,
  type       notification_type not null default 'general',
  title      text not null,
  message    text not null,
  is_read    boolean not null default false,
  priority   notification_priority not null default 'normal',
  action_url text,
  image      text,
  created_at timestamptz not null default now()
);

create index idx_notifications_user_id on public.notifications(user_id, created_at desc);
create index idx_notifications_is_read on public.notifications(user_id, is_read);
```

---

### 3.21 Subscriptions Table
```sql
create table public.subscriptions (
  id                  uuid primary key default uuid_generate_v4(),
  email               text not null unique,
  source              text,
  pref_newsletter     boolean not null default true,
  pref_promotions     boolean not null default true,
  pref_new_products   boolean not null default true,
  status              text not null default 'active' check (status in ('active', 'unsubscribed')),
  subscribed_at       timestamptz not null default now()
);
```

---

### 3.22 Contact Submissions Table
```sql
create table public.contacts (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  email      text not null,
  subject    text,
  message    text not null,
  created_at timestamptz not null default now()
);
```

---

### 3.23 Banners Tables
```sql
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

create trigger banners_updated_at before update on public.banners
  for each row execute procedure public.update_updated_at();
create trigger ads_banners_updated_at before update on public.ads_banners
  for each row execute procedure public.update_updated_at();
create trigger product_banners_updated_at before update on public.product_banners
  for each row execute procedure public.update_updated_at();
```

---

### 3.24 Website Config & Icons
```sql
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
  id                           uuid primary key default uuid_generate_v4(),
  tax_rate                     numeric(5,2) default 0,
  free_delivery_threshold      numeric(12,2) default 0,
  platform_commission_pct      numeric(5,2) default 0,
  max_product_images           integer default 5,
  default_user_image           text,
  updated_at                   timestamptz not null default now()
);

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
```

---

### 3.25 Component Types & Roles/Permissions
```sql
create table public.component_types (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  type        text not null unique,
  description text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Note: roles/permissions are now handled by Supabase RLS + user.role column
-- If you need a full RBAC table system, keep these:
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
```

---

## 4. Phase 2 — Supabase Auth

### 4.1 Enable Auth Providers in Supabase Dashboard

Go to **Authentication → Providers** in your Supabase project:

1. **Email** — Enable, turn on "Confirm email" for email verification
2. **Google** — Enable, add Client ID + Secret from Google Cloud Console
3. **GitHub** — Enable, add Client ID + Secret from GitHub OAuth Apps

This replaces: Firebase Auth, JWT `authController.ts`, `/api/auth/oauth` endpoint.

---

### 4.2 Supabase Auth Config (supabase/config.toml or Dashboard)

```toml
[auth]
site_url = "http://localhost:3000"
additional_redirect_urls = ["http://localhost:5173", "https://entry.reactbd.com", "https://admin.entry.reactbd.com"]

[auth.email]
enable_confirmations = true
double_confirm_changes = true

[auth.external.google]
enabled = true
client_id = "env(GOOGLE_CLIENT_ID)"
secret = "env(GOOGLE_CLIENT_SECRET)"

[auth.external.github]
enabled = true
client_id = "env(GITHUB_CLIENT_ID)"
secret = "env(GITHUB_CLIENT_SECRET)"
```

---

### 4.3 Auth Flow Mapping (Old → New)

| Old Express Endpoint | New Supabase Method |
|---|---|
| `POST /api/auth/register` | `supabase.auth.signUp({ email, password })` |
| `POST /api/auth/login` | `supabase.auth.signInWithPassword({ email, password })` |
| `POST /api/auth/oauth` (Google) | `supabase.auth.signInWithOAuth({ provider: 'google' })` |
| `POST /api/auth/oauth` (GitHub) | `supabase.auth.signInWithOAuth({ provider: 'github' })` |
| `POST /api/auth/logout` | `supabase.auth.signOut()` |
| `POST /api/auth/forgot-password` | `supabase.auth.resetPasswordForEmail(email)` |
| `POST /api/auth/reset-password` | `supabase.auth.updateUser({ password: newPassword })` |
| `GET /api/auth/verify-email` | Handled by Supabase email link automatically |
| `POST /api/auth/refresh` | `supabase.auth.refreshSession()` |
| `GET /api/auth/profile` | `supabase.auth.getUser()` + query `public.users` |
| `PUT /api/auth/set-password` | `supabase.auth.updateUser({ password })` |

---

### 4.4 Custom Claims for Roles

Store `role` and `employee_role` in the JWT via a Supabase hook so they are available in RLS policies without a DB query each time.

```sql
-- Function to inject custom claims into the JWT
create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb language plpgsql stable as $$
declare
  claims jsonb;
  user_role_val text;
  emp_role_val text;
begin
  select role::text, employee_role::text
    into user_role_val, emp_role_val
    from public.users
   where id = (event->>'user_id')::uuid;

  claims := event->'claims';
  claims := jsonb_set(claims, '{user_role}', to_jsonb(coalesce(user_role_val, 'user')));

  if emp_role_val is not null then
    claims := jsonb_set(claims, '{employee_role}', to_jsonb(emp_role_val));
  end if;

  return jsonb_set(event, '{claims}', claims);
end;
$$;

grant execute on function public.custom_access_token_hook to supabase_auth_admin;
```

Then register this function in **Supabase Dashboard → Authentication → Hooks → Custom Access Token**.

After this, in RLS policies you can use:
```sql
(auth.jwt()->>'user_role') = 'admin'
(auth.jwt()->>'employee_role') = 'packer'
```

---

## 5. Phase 3 — Row Level Security (RLS)

Enable RLS on every table and add policies. This replaces all Express middleware (`protect`, `admin`, `employee`, etc.).

### 5.1 Helper Functions
```sql
-- Returns the current user's role from JWT claims
create or replace function public.get_user_role()
returns text language sql stable as $$
  select coalesce(auth.jwt()->>'user_role', 'user')
$$;

-- Returns the current user's employee_role from JWT claims
create or replace function public.get_employee_role()
returns text language sql stable as $$
  select auth.jwt()->>'employee_role'
$$;

-- Checks if current user is admin
create or replace function public.is_admin()
returns boolean language sql stable as $$
  select public.get_user_role() = 'admin'
$$;

-- Checks if current user is admin or employee
create or replace function public.is_staff()
returns boolean language sql stable as $$
  select public.get_user_role() in ('admin', 'employee')
$$;
```

---

### 5.2 Users Table RLS
```sql
alter table public.users enable row level security;

-- Anyone can read public profile data
create policy "users_select_own" on public.users
  for select using (auth.uid() = id or public.is_staff());

-- Users can only update their own profile
create policy "users_update_own" on public.users
  for update using (auth.uid() = id)
  with check (
    auth.uid() = id and
    -- Prevent users from changing their own role
    role = (select role from public.users where id = auth.uid())
  );

-- Only admins can update roles
create policy "users_admin_update" on public.users
  for update using (public.is_admin());

-- Insert handled by trigger (on_auth_user_created)
create policy "users_insert_trigger" on public.users
  for insert with check (true);
```

---

### 5.3 Addresses RLS
```sql
alter table public.addresses enable row level security;

create policy "addresses_own" on public.addresses
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "addresses_staff_read" on public.addresses
  for select using (public.is_staff());
```

---

### 5.4 Products RLS
```sql
alter table public.products enable row level security;

-- Public read for approved products
create policy "products_public_read" on public.products
  for select using (approval_status = 'approved');

-- Staff and admin can read all
create policy "products_staff_read" on public.products
  for select using (public.is_staff() or public.is_admin());

-- Sellers can read their own products regardless of status
create policy "products_seller_read_own" on public.products
  for select using (
    public.get_user_role() = 'seller' and
    seller_id = (select id from public.sellers where user_id = auth.uid())
  );

-- Admin can insert/update/delete all products
create policy "products_admin_all" on public.products
  for all using (public.is_admin());

-- Sellers can insert products (they go into pending)
create policy "products_seller_insert" on public.products
  for insert with check (
    public.get_user_role() = 'seller' and
    seller_id = (select id from public.sellers where user_id = auth.uid()) and
    approval_status = 'pending'
  );

-- Sellers can update only their own pending/rejected products
create policy "products_seller_update_own" on public.products
  for update using (
    public.get_user_role() = 'seller' and
    seller_id = (select id from public.sellers where user_id = auth.uid()) and
    approval_status != 'approved'
  );
```

---

### 5.5 Cart & Wishlist RLS
```sql
alter table public.cart_items enable row level security;
alter table public.wishlist_items enable row level security;

create policy "cart_own" on public.cart_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "wishlist_own" on public.wishlist_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

---

### 5.6 Orders RLS
```sql
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_status_history enable row level security;

-- Users see only their orders
create policy "orders_own_read" on public.orders
  for select using (auth.uid() = user_id);

-- Users can create their own orders
create policy "orders_own_insert" on public.orders
  for insert with check (auth.uid() = user_id);

-- Admin reads all orders
create policy "orders_admin_all" on public.orders
  for all using (public.is_admin());

-- Staff (employees) can read and update order status
create policy "orders_staff_read" on public.orders
  for select using (public.is_staff());

-- Packer can update orders assigned to them (status: confirmed → packed)
create policy "orders_packer_update" on public.orders
  for update using (
    public.get_employee_role() = 'packer' and
    assigned_packer = auth.uid()
  );

-- Deliveryman can update orders assigned to them
create policy "orders_deliveryman_update" on public.orders
  for update using (
    public.get_employee_role() in ('deliveryman', 'incharge') and
    assigned_deliveryman = auth.uid()
  );

-- Order items follow order visibility
create policy "order_items_via_order" on public.order_items
  for select using (
    exists (
      select 1 from public.orders
      where id = order_items.order_id
        and (user_id = auth.uid() or public.is_staff())
    )
  );

-- Admin/staff can insert order items
create policy "order_items_insert" on public.order_items
  for insert with check (true);

-- Order history: follows order visibility
create policy "order_history_read" on public.order_status_history
  for select using (
    exists (
      select 1 from public.orders
      where id = order_status_history.order_id
        and (user_id = auth.uid() or public.is_staff())
    )
  );

create policy "order_history_insert" on public.order_status_history
  for insert with check (public.is_staff() or public.is_admin());
```

---

### 5.7 Cash Collections RLS
```sql
alter table public.cash_collections enable row level security;

-- Deliveryman sees their own collections
create policy "cash_deliveryman_own" on public.cash_collections
  for select using (collected_by = auth.uid());

-- Accounts sees all submitted/confirmed collections
create policy "cash_accounts_read" on public.cash_collections
  for select using (
    public.get_employee_role() in ('accounts', 'incharge') or public.is_admin()
  );

-- Deliveryman can insert (mark collected)
create policy "cash_deliveryman_insert" on public.cash_collections
  for insert with check (
    public.get_employee_role() in ('deliveryman', 'incharge') and
    collected_by = auth.uid()
  );

-- Deliveryman can submit (update status to submitted)
create policy "cash_deliveryman_submit" on public.cash_collections
  for update using (
    collected_by = auth.uid() and status = 'collected'
  );

-- Accounts can confirm
create policy "cash_accounts_confirm" on public.cash_collections
  for update using (
    public.get_employee_role() in ('accounts', 'incharge') and status = 'submitted'
  );

-- Admin full access
create policy "cash_admin_all" on public.cash_collections
  for all using (public.is_admin());
```

---

### 5.8 Sellers RLS
```sql
alter table public.sellers enable row level security;

-- Public can read approved sellers
create policy "sellers_public_read" on public.sellers
  for select using (status = 'approved');

-- Sellers can read their own profile
create policy "sellers_own_read" on public.sellers
  for select using (user_id = auth.uid());

-- Sellers can update their own profile
create policy "sellers_own_update" on public.sellers
  for update using (user_id = auth.uid());

-- Anyone authenticated can apply as seller (insert)
create policy "sellers_insert" on public.sellers
  for insert with check (auth.uid() = user_id and status = 'pending');

-- Admin full access
create policy "sellers_admin_all" on public.sellers
  for all using (public.is_admin());
```

---

### 5.9 Content & Config Tables RLS
```sql
-- Banners, config, social media: public read, admin write
alter table public.banners enable row level security;
alter table public.ads_banners enable row level security;
alter table public.product_banners enable row level security;
alter table public.website_config enable row level security;
alter table public.social_media enable row level security;
alter table public.base_config enable row level security;

create policy "banners_public_read" on public.banners for select using (true);
create policy "banners_admin_write" on public.banners for all using (public.is_admin());

create policy "ads_banners_public_read" on public.ads_banners for select using (true);
create policy "ads_banners_admin_write" on public.ads_banners for all using (public.is_admin());

create policy "product_banners_public_read" on public.product_banners for select using (true);
create policy "product_banners_admin_write" on public.product_banners for all using (public.is_admin());

create policy "website_config_public_read" on public.website_config for select using (true);
create policy "website_config_admin_write" on public.website_config for all using (public.is_admin());

create policy "social_media_public_read" on public.social_media for select using (true);
create policy "social_media_admin_write" on public.social_media for all using (public.is_admin());

create policy "base_config_public_read" on public.base_config for select using (true);
create policy "base_config_admin_write" on public.base_config for all using (public.is_admin());
```

---

### 5.10 Notifications RLS
```sql
alter table public.notifications enable row level security;

create policy "notifications_own" on public.notifications
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "notifications_staff_insert" on public.notifications
  for insert with check (public.is_staff() or public.is_admin());
```

---

### 5.11 Purchases & Suppliers RLS
```sql
alter table public.purchases enable row level security;
alter table public.purchase_items enable row level security;
alter table public.suppliers enable row level security;

-- Only staff and admin can access purchases and suppliers
create policy "purchases_staff_all" on public.purchases
  for all using (public.is_staff() or public.is_admin());

create policy "purchase_items_staff_all" on public.purchase_items
  for all using (public.is_staff() or public.is_admin());

create policy "suppliers_staff_all" on public.suppliers
  for all using (public.is_staff() or public.is_admin());
```

---

## 6. Phase 4 — Edge Functions (Complex Logic)

The following operations cannot be done with simple Supabase client queries and need Edge Functions (deployed to `supabase/functions/`).

### 6.1 Edge Functions List

| Function Name | Replaces | Trigger |
|---|---|---|
| `stripe-webhook` | `paymentController.ts` webhook handler | Stripe HTTP POST |
| `sslcommerz-notify` | `sslcommerzController.ts` notify handler | SSLCommerz HTTP POST |
| `order-workflow` | `orderWorkflowController.ts` | Frontend HTTP call |
| `send-email` | `notificationService.ts` + Nodemailer | Internal calls |
| `upload-sign` | `uploadController.ts` signed URL | Frontend HTTP call |
| `analytics` | `analyticsController.ts` aggregation | Frontend HTTP call |
| `search` | `searchController.ts` full-text search | Frontend HTTP call |
| `bulk-products` | `productController.ts` bulk create/delete | Admin frontend |

---

### 6.2 Edge Function Structure
```
apps/api/  (will become minimal, Edge Functions only)
│
supabase/
└── functions/
    ├── stripe-webhook/
    │   └── index.ts
    ├── sslcommerz-notify/
    │   └── index.ts
    ├── order-workflow/
    │   └── index.ts
    ├── send-email/
    │   └── index.ts
    ├── upload-sign/
    │   └── index.ts
    ├── analytics/
    │   └── index.ts
    └── search/
        └── index.ts
```

---

### 6.3 Example: stripe-webhook Edge Function
```typescript
// supabase/functions/stripe-webhook/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@12'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2023-10-16' })
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!  // service role bypasses RLS
)

serve(async (req) => {
  const sig = req.headers.get('stripe-signature')!
  const body = await req.text()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, Deno.env.get('STRIPE_WEBHOOK_SECRET')!)
  } catch {
    return new Response('Webhook signature verification failed', { status: 400 })
  }

  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object as Stripe.PaymentIntent
    await supabase
      .from('orders')
      .update({
        payment_status: 'paid',
        paid_at: new Date().toISOString(),
        stripe_payment_intent_id: intent.id,
        stripe_card_brand: intent.payment_method_types[0],
        paid_amount: intent.amount / 100,
      })
      .eq('stripe_payment_intent_id', intent.id)
  }

  if (event.type === 'payment_intent.payment_failed') {
    const intent = event.data.object as Stripe.PaymentIntent
    await supabase
      .from('orders')
      .update({ payment_status: 'failed' })
      .eq('stripe_payment_intent_id', intent.id)
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

---

### 6.4 Example: order-workflow Edge Function
```typescript
// supabase/functions/order-workflow/index.ts
// Handles complex order status transitions with role validation

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
  )

  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return new Response('Unauthorized', { status: 401 })

  const { orderId, newStatus, notes, assignedPacker, assignedDeliveryman } = await req.json()

  // Validate transition and update order + add history entry
  const { data: order } = await supabase.from('orders').select('*').eq('id', orderId).single()

  // ... transition validation logic ...

  const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId)
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })

  await supabase.from('order_status_history').insert({
    order_id: orderId,
    status: newStatus,
    changed_by: user.id,
    changed_by_name: user.user_metadata.name,
    notes: notes || '',
  })

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

---

## 7. Phase 5 — Web App Migration (apps/web)

### 7.1 Install Supabase Client

```bash
# In apps/web only (admin covered in Phase 6)
pnpm add @supabase/supabase-js @supabase/ssr --filter=@entry/web
pnpm remove firebase --filter=@entry/web
```

---

### 7.2 Supabase Client Files

Create `apps/web/lib/supabase/client.ts` (browser components):
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

Create `apps/web/lib/supabase/server.ts` (server components & route handlers):
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
```

---

### 7.3 Next.js Middleware (Auth Guard)

Create `apps/web/middleware.ts`:
```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user && request.nextUrl.pathname.startsWith('/account')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  if (!user && request.nextUrl.pathname.startsWith('/checkout')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/account/:path*', '/checkout/:path*']
}
```

---

### 7.4 Auth Callback Route

Create `apps/web/app/auth/callback/route.ts`:
```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  return NextResponse.redirect(`${origin}/account`)
}
```

---

### 7.5 Auth Store Update (apps/web)

Replace Firebase auth in the web Zustand auth store:

**Old:**
```typescript
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
```

**New:**
```typescript
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

// In store actions:
const login = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  set({ user: data.user, session: data.session, isAuthenticated: true })
}

const loginWithGoogle = async () => {
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/auth/callback` }
  })
}

const logout = async () => {
  await supabase.auth.signOut()
  set({ user: null, session: null, isAuthenticated: false })
}

// Listen to auth state changes globally (call once in layout)
supabase.auth.onAuthStateChange((event, session) => {
  set({ user: session?.user ?? null, session, isAuthenticated: !!session })
})
```

---

### 7.6 API Call Migration (Web)

Replace all `axios` calls with Supabase client.

**Products listing:**
```typescript
// Old
const res = await axios.get(`${API}/products?category=${id}&page=1`)

// New
const { data, error } = await supabase
  .from('products')
  .select(`
    id, name, slug, price, discount_percentage, image, images,
    average_rating, num_reviews, stock,
    category:categories(id, name, slug),
    brand:brands(id, name)
  `)
  .eq('approval_status', 'approved')
  .eq('category_id', categoryId)
  .range(0, 23)
  .order('created_at', { ascending: false })
```

**Cart operations:**
```typescript
// Add to cart
await supabase.from('cart_items').upsert({
  user_id: user.id, product_id: productId, quantity
}, { onConflict: 'user_id,product_id' })

// Get cart with product details
const { data } = await supabase
  .from('cart_items')
  .select('quantity, product:products(id, name, price, image, stock)')
  .eq('user_id', user.id)
```

**Order placement (Edge Function):**
```typescript
// Complex logic → Edge Function
const { data, error } = await supabase.functions.invoke('create-order', {
  body: { cartItems, shippingAddressId, paymentMethod }
})
```

**Stripe payment (Edge Function):**
```typescript
const { data } = await supabase.functions.invoke('create-payment-intent', {
  body: { orderId, amount, currency: 'bdt' }
})
```

---

### 7.7 Web Environment Variables

**`apps/web/.env`:**
```env
# Add
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Keep
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_TAX_AMOUNT=0
NEXT_PUBLIC_FREE_DELIVERY_THRESHOLD=500
NEXT_PUBLIC_DYNAMIC_HOMEPAGE=true
REVALIDATION_TIME=60

# DELETE all of these
# API_ENDPOINT=
# NEXT_PUBLIC_API_URL=
# NEXT_PUBLIC_FIREBASE_API_KEY=
# NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
# NEXT_PUBLIC_FIREBASE_PROJECT_ID=
# NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
# NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
# NEXT_PUBLIC_FIREBASE_APP_ID=
# NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
```

---

## 8. Phase 6 — Admin App Migration (apps/admin)

The admin is more complex than the web app because it has:
- Its own `useAuthStore` with JWT token management and refresh queue
- `useAxiosPrivate` hook (interceptors for 401 → logout)
- Firebase Storage for ALL image uploads (not Cloudinary)
- Role-based menu access system (`rolePermissions.ts`)
- Email-based read-only user system (`readOnlyConfig.ts`)
- 44 routes with role-restricted access per page

---

### 8.1 Install Supabase, Remove Firebase

```bash
pnpm add @supabase/supabase-js --filter=@entry/admin
pnpm remove firebase --filter=@entry/admin
```

---

### 8.2 Supabase Client (admin)

Replace `apps/admin/src/lib/firebase.ts` (auth part) and create:

`apps/admin/src/lib/supabase.ts`:
```typescript
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

---

### 8.3 Replace useAuthStore (Critical)

The current `useAuthStore` manages JWT `accessToken` + `refreshToken` manually, stores them in localStorage, and handles a refresh queue. All of this is replaced by Supabase session management.

**File:** `apps/admin/src/store/useAuthStore.ts`

**Old state shape:**
```typescript
{ user, token, refreshToken, isAuthenticated }
```

**New state shape:**
```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

type AdminUser = {
  id: string
  name: string
  email: string
  avatar: string
  role: string
  employee_role: string | null
}

type AuthState = {
  user: AdminUser | null
  session: Session | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  loginWithGitHub: () => Promise<void>
  logout: () => Promise<void>
  setSession: (session: Session | null) => void
  checkIsAdmin: () => boolean
  canPerformCRUD: () => boolean
  isReadOnly: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isAuthenticated: false,

      setSession: (session) => {
        if (session) {
          // Load profile from public.users
          supabase
            .from('users')
            .select('id, name, email, avatar, role, employee_role')
            .eq('id', session.user.id)
            .single()
            .then(({ data }) => {
              set({ user: data, session, isAuthenticated: true })
            })
        } else {
          set({ user: null, session: null, isAuthenticated: false })
        }
      },

      login: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        // setSession will be called by onAuthStateChange listener
      },

      loginWithGoogle: async () => {
        await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo: `${window.location.origin}/auth/callback` }
        })
      },

      loginWithGitHub: async () => {
        await supabase.auth.signInWithOAuth({
          provider: 'github',
          options: { redirectTo: `${window.location.origin}/auth/callback` }
        })
      },

      logout: async () => {
        await supabase.auth.signOut()
        set({ user: null, session: null, isAuthenticated: false })
      },

      checkIsAdmin: () => get().user?.role === 'admin',

      canPerformCRUD: () => {
        const { user } = get()
        if (!user) return false
        if (READ_ONLY_USERS.includes(user.email)) return false
        return user.role === 'admin'
      },

      isReadOnly: () => {
        const { user } = get()
        if (!user) return true
        return READ_ONLY_USERS.includes(user.email)
      },
    }),
    { name: 'auth-storage', partialize: (s) => ({ user: s.user, session: s.session, isAuthenticated: s.isAuthenticated }) }
  )
)

// Bootstrap: listen to Supabase auth state changes
// Call this once in main.tsx or App.tsx
export function initAuthListener() {
  supabase.auth.onAuthStateChange((event, session) => {
    useAuthStore.getState().setSession(session)
  })
}
```

In `apps/admin/src/main.tsx`, add:
```typescript
import { initAuthListener } from '@/store/useAuthStore'
initAuthListener()
```

---

### 8.4 Replace useAxiosPrivate (Critical)

The `useAxiosPrivate` hook + axios interceptors for 401 handling are no longer needed. Supabase client handles auth tokens and session refresh automatically.

**Delete:** `apps/admin/src/hooks/useAxiosPrivate.ts`

**Delete:** `apps/admin/src/lib/config.ts` (the axios instance with interceptors)

Replace with a simple Supabase query helper. All pages that currently do:
```typescript
const axiosPrivate = useAxiosPrivate()
const res = await axiosPrivate.get('/products', { params: { page, perPage } })
```

Now do:
```typescript
import { supabase } from '@/lib/supabase'

const { data, error, count } = await supabase
  .from('products')
  .select('*, category:categories(name), brand:brands(name)', { count: 'exact' })
  .range((page - 1) * perPage, page * perPage - 1)
  .order('created_at', { ascending: false })
```

---

### 8.5 Replace Firebase Storage (Critical)

The admin uses Firebase Storage for **all** image uploads: products, categories, banners, avatars, icons. Replace with **Supabase Storage**.

**Step 1:** Create storage buckets in Supabase Dashboard → Storage:
```
products      (public)
categories    (public)
banners       (public)
avatars       (public)
icons         (public)
```

**Step 2:** Set bucket policies (public read, authenticated write):
```sql
-- In SQL Editor, for each bucket:
create policy "public read products" on storage.objects
  for select using (bucket_id = 'products');

create policy "auth upload products" on storage.objects
  for insert with check (bucket_id = 'products' and auth.role() = 'authenticated');

create policy "auth delete products" on storage.objects
  for delete using (bucket_id = 'products' and auth.role() = 'authenticated');
```

**Step 3:** Replace `apps/admin/src/lib/firebase.ts` upload functions:

**Old (Firebase Storage):**
```typescript
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'

export async function uploadToFirebase(file: File, folder = 'uploads'): Promise<string> {
  const storageRef = ref(storage, `${folder}/${Date.now()}_${file.name}`)
  await uploadBytes(storageRef, file)
  return getDownloadURL(storageRef)
}
```

**New (Supabase Storage):**
```typescript
// apps/admin/src/lib/storage.ts
import { supabase } from './supabase'

export async function uploadToSupabase(file: File, bucket: string): Promise<string> {
  const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, { cacheControl: '3600', upsert: false })

  if (error) throw error

  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path)
  return publicUrl
}

export async function deleteFromSupabase(url: string, bucket: string): Promise<void> {
  // Extract file path from full URL
  const path = url.split(`/storage/v1/object/public/${bucket}/`)[1]
  if (!path) return
  await supabase.storage.from(bucket).remove([path])
}
```

**Step 4:** Update all components that call `uploadToFirebase` / `deleteFromFirebase`:

| Component | Old bucket/folder | New bucket |
|---|---|---|
| ProductsPage | `uploads/products` | `products` |
| CategoriesPage | `uploads/categories` | `categories` |
| BannersPage | `uploads/banners` | `banners` |
| AdsBannersPage | `uploads/ads` | `banners` |
| ProductBannersPage | `uploads/product-banners` | `banners` |
| WebsiteIconsPage | `uploads/icons` | `icons` |
| AccountPage (avatar) | `uploads/avatars` | `avatars` |
| ProductTypesPage | `uploads/product-types` | `products` |

---

### 8.6 Auth Callback Route (admin — Vite SPA)

Since admin is a Vite SPA (not Next.js), handle the OAuth callback in React Router.

Create `apps/admin/src/pages/auth/CallbackPage.tsx`:
```typescript
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

export default function CallbackPage() {
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/dashboard', { replace: true })
      } else {
        navigate('/login', { replace: true })
      }
    })
  }, [navigate])

  return <div>Signing you in...</div>
}
```

Add to `App.tsx` routes:
```typescript
<Route path="/auth/callback" element={<CallbackPage />} />
```

---

### 8.7 DashboardLayout Auth Guard

**Old** (checks localStorage token via Zustand):
```typescript
const { isAuthenticated } = useAuthStore()
if (!isAuthenticated) return <Navigate to="/login" />
```

**New** (also verify Supabase session is live):
```typescript
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/useAuthStore'

export default function DashboardLayout() {
  const { isAuthenticated, user } = useAuthStore()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) useAuthStore.getState().setSession(null)
      setChecking(false)
    })
  }, [])

  if (checking) return <LoadingSpinner />
  if (!isAuthenticated) return <Navigate to="/login" replace />

  // Role gate: only admin and employee can access dashboard
  if (user && user.role === 'user') return <Navigate to="/login" replace />

  return <Layout />
}
```

---

### 8.8 Role-Based Menu Access (rolePermissions.ts)

The current `rolePermissions.ts` file maps routes to allowed roles. This logic stays — it is purely frontend UI logic (show/hide sidebar items). No changes needed to the rules themselves.

Only the **data source changes**: instead of reading from JWT decoded token, read from `useAuthStore().user.role` and `useAuthStore().user.employee_role` which now come from `public.users`.

The file `apps/admin/src/lib/rolePermissions.ts` keeps its `canAccessMenuItem()` function unchanged — just ensure it receives `user.role` and `user.employee_role` from the updated store.

---

### 8.9 Read-Only Users (readOnlyConfig.ts)

The current approach checks against a hardcoded email list. This stays as-is — it is a frontend UI gate only (hides Create/Edit/Delete buttons).

`apps/admin/src/lib/readOnlyConfig.ts` requires no changes. The `useAuthStore.canPerformCRUD()` and `useAuthStore.isReadOnly()` methods in the new store (section 8.3 above) already replicate this logic.

---

### 8.10 Admin API Calls — Full Page-by-Page Migration

Every page currently uses `axiosPrivate.get/post/put/delete`. Below is the replacement pattern for each:

#### Dashboard Stats
```typescript
// Old: axiosPrivate.get('/stats/dashboard')
// New:
const [ordersCount, usersCount, productsCount, revenue] = await Promise.all([
  supabase.from('orders').select('id', { count: 'exact', head: true }),
  supabase.from('users').select('id', { count: 'exact', head: true }),
  supabase.from('products').select('id', { count: 'exact', head: true }),
  supabase.from('orders').select('total').eq('payment_status', 'paid')
])
```

#### Users Page
```typescript
// List with pagination + search
const { data, count } = await supabase
  .from('users')
  .select('*', { count: 'exact' })
  .ilike('name', `%${search}%`)
  .range(offset, offset + perPage - 1)
  .order('created_at', { ascending: false })

// Update role → Edge Function (role changes have side effects)
await supabase.functions.invoke('update-user-role', {
  body: { userId, role, employee_role }
})

// Delete user → Edge Function (must delete auth.users too)
await supabase.functions.invoke('delete-user', { body: { userId } })
```

#### Products Page
```typescript
// List (all statuses for admin)
const { data, count } = await supabase
  .from('products')
  .select(`
    *, category:categories(name), brand:brands(name),
    seller:sellers(store_name)
  `, { count: 'exact' })
  .ilike('name', `%${search}%`)
  .range(offset, offset + perPage - 1)
  .order('created_at', { ascending: false })

// Approve product
await supabase.from('products')
  .update({ approval_status: 'approved' })
  .eq('id', productId)

// Bulk delete
await supabase.from('products').delete().in('id', selectedIds)

// Create/Update (image uploaded to Supabase Storage first, then save URL)
const imageUrl = await uploadToSupabase(file, 'products')
await supabase.from('products').insert({ ...productData, image: imageUrl, images: [imageUrl] })
```

#### Categories Page
```typescript
// Get full tree
const { data } = await supabase
  .from('categories')
  .select('*')
  .order('level').order('sort_order')

// Build tree client-side from flat list
function buildTree(categories, parentId = null) {
  return categories
    .filter(c => c.parent_id === parentId)
    .map(c => ({ ...c, children: buildTree(categories, c.id) }))
}

// Create with image upload
const imageUrl = await uploadToSupabase(file, 'categories')
await supabase.from('categories').insert({ name, parent_id, image: imageUrl })
```

#### Orders Page
```typescript
// List orders (role-filtered via RLS automatically)
const { data, count } = await supabase
  .from('orders')
  .select(`
    *,
    user:users(name, email),
    items:order_items(*, product:products(name, image)),
    history:order_status_history(*)
  `, { count: 'exact' })
  .eq(filterByStatus ? 'status' : 'id', filterByStatus || '*')
  .range(offset, offset + perPage - 1)
  .order('created_at', { ascending: false })

// Update status → Edge Function (handles history + notifications)
await supabase.functions.invoke('order-workflow', {
  body: { orderId, newStatus, notes, assignedPacker, assignedDeliveryman }
})
```

#### Banners / Ads Banners / Product Banners
```typescript
// Image upload first, then save
const imageUrl = await uploadToSupabase(file, 'banners')

await supabase.from('banners').insert({ image: imageUrl, title, link, is_active: true })
await supabase.from('banners').update({ is_active: !current }).eq('id', id)  // toggle
await supabase.from('banners').delete().eq('id', id)
```

#### Sellers Page
```typescript
// List all sellers with user info
const { data } = await supabase
  .from('sellers')
  .select('*, user:users(name, email, avatar)')
  .order('created_at', { ascending: false })

// Approve/reject
await supabase.from('sellers').update({ status: 'approved' }).eq('id', sellerId)
```

#### Purchases Page
```typescript
// List with status filter
const { data } = await supabase
  .from('purchases')
  .select(`
    *, items:purchase_items(*),
    history:purchase_status_history(*)
  `)
  .eq(statusFilter ? 'status' : 'id', statusFilter || '*')
  .order('created_at', { ascending: false })

// Status transitions → Edge Function
await supabase.functions.invoke('purchase-workflow', {
  body: { purchaseId, newStatus, notes }
})
```

#### Analytics Page
```typescript
// Revenue trends → Edge Function (complex aggregation)
const { data } = await supabase.functions.invoke('analytics', {
  body: { type: 'revenue', period: 'monthly', year: 2025 }
})
```

#### Search Page
```typescript
// Global search → Edge Function (searches across multiple tables)
const { data } = await supabase.functions.invoke('search', {
  body: { query, types: ['orders', 'users', 'products', 'sellers'] }
})
```

#### Website Config / Base Config / Social Media
```typescript
// Single-row config tables
const { data } = await supabase.from('website_config').select('*').single()
await supabase.from('website_config').update({ store_name, tagline, logo }).eq('id', configId)
```

#### Notifications Page
```typescript
// Send bulk notification → Edge Function
await supabase.functions.invoke('send-notification', {
  body: { userIds, title, message, type, actionUrl }
})

// List notifications for current user
const { data } = await supabase
  .from('notifications')
  .select('*')
  .order('created_at', { ascending: false })
```

---

### 8.11 Admin Environment Variables

**`apps/admin/.env`:**
```env
# Add
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# Keep
CLIENT_URL=http://localhost:3000
VITE_APP_ENV=development

# DELETE all of these
# VITE_NEXT_PUBLIC_API_URL=
# VITE_FIREBASE_API_KEY=
# VITE_FIREBASE_AUTH_DOMAIN=
# VITE_FIREBASE_PROJECT_ID=
# VITE_FIREBASE_STORAGE_BUCKET=
# VITE_FIREBASE_MESSAGING_SENDER_ID=
# VITE_FIREBASE_APP_ID=
# VITE_FIREBASE_MEASUREMENT_ID=
```

---

### 8.12 Admin Files to Delete After Migration

| File | Reason |
|---|---|
| `src/lib/firebase.ts` | Firebase replaced by Supabase |
| `src/lib/oauthService.ts` | OAuth now handled by Supabase |
| `src/lib/config.ts` | Axios instance replaced by Supabase client |
| `src/hooks/useAxiosPrivate.ts` | Supabase client handles auth/refresh |
| `src/contexts/ApiDebugContext.tsx` | Axios interceptors no longer exist |
| `src/store/apiDebugStore.ts` | Same reason |
| `src/components/debug/ApiDebugger.tsx` | Same reason |

---

## 9. Phase 7 — Data Migration Scripts

Run these once to move existing MongoDB data into Supabase PostgreSQL.

### 9.1 Install Migration Dependencies (root workspace)
```bash
pnpm add -D mongodb pg dotenv tsx --filter=@entry/root
```

### 9.2 Migration Script Structure
```
scripts/
├── migrate-data.ts          (existing - repurpose this)
├── migration/
│   ├── 01-users.ts
│   ├── 02-categories.ts
│   ├── 03-brands.ts
│   ├── 04-product-types.ts
│   ├── 05-sellers.ts
│   ├── 06-products.ts
│   ├── 07-orders.ts
│   ├── 08-cart-wishlist.ts
│   ├── 09-notifications.ts
│   ├── 10-banners.ts
│   ├── 11-config.ts
│   └── run-all.ts
```

### 9.3 Example User Migration Script
```typescript
// scripts/migration/01-users.ts
import { MongoClient } from 'mongodb'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const mongo = new MongoClient(process.env.MONGO_URI!)
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // need service role for admin operations
)

export async function migrateUsers() {
  await mongo.connect()
  const db = mongo.db()
  const users = await db.collection('users').find({}).toArray()

  console.log(`Migrating ${users.length} users...`)

  for (const user of users) {
    // 1. Create auth user in Supabase (sets up auth.users)
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: user.email,
      email_confirm: user.emailVerified ?? false,
      user_metadata: {
        name: user.name,
        avatar: user.avatar,
        provider: user.authProvider ?? 'local',
      },
    })

    if (authError) {
      console.error(`Failed to create auth user for ${user.email}:`, authError.message)
      continue
    }

    // 2. Update public.users profile (created by trigger, just update fields)
    await supabase.from('users').update({
      name: user.name,
      avatar: user.avatar,
      role: user.role ?? 'user',
      employee_role: user.employee_role ?? null,
      auth_provider: user.authProvider ?? 'local',
      has_set_password: user.hasSetPassword ?? true,
      email_verified: user.emailVerified ?? false,
      created_at: user.createdAt?.toISOString(),
    }).eq('id', authUser.user.id)

    // 3. Migrate addresses
    if (user.addresses?.length) {
      const addressRows = user.addresses.map((a: any) => ({
        user_id: authUser.user.id,
        street: a.street,
        city: a.city,
        state: a.state,
        country: a.country,
        postal_code: a.postalCode,
        is_default: a.isDefault ?? false,
      }))
      await supabase.from('addresses').insert(addressRows)
    }
  }

  console.log('Users migration complete.')
  await mongo.close()
}
```

### 9.4 Migration Run Order
Always run in this order due to foreign key dependencies:
```
01-users        (no dependencies)
02-categories   (no dependencies, self-referential — handle root first)
03-brands       (no dependencies)
04-product-types (no dependencies)
05-sellers      (depends on users)
06-products     (depends on categories, brands, sellers)
07-orders       (depends on users, products, sellers)
08-cart-wishlist (depends on users, products)
09-notifications (depends on users)
10-banners      (no dependencies)
11-config       (no dependencies)
```

### 9.5 Category Migration Note (hierarchy ordering)
```typescript
// Migrate root categories first (parent_id = null), then children level by level
const rootCategories = mongoCategories.filter(c => !c.parent)
const level1 = mongoCategories.filter(c => c.parent && rootIds.includes(c.parent.toString()))
// etc.
```

---

## 10. Environment Variables

### Supabase Project Variables
```env
# Supabase (all apps)
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=eyJ...           # safe for frontend
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # NEVER expose to frontend — Edge Functions only

# Edge Functions (set in Supabase Dashboard → Settings → Edge Functions)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
SSLCOMMERZ_STORE_ID=...
SSLCOMMERZ_STORE_PASSWORD=...
SMTP_HOST=...
SMTP_PORT=...
SMTP_USER=...
SMTP_PASS=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
TAX_RATE=...
FREE_DELIVERY_THRESHOLD=...
PLATFORM_COMMISSION_PERCENTAGE=...
```

### apps/web `.env`
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_TAX_AMOUNT=0
NEXT_PUBLIC_FREE_DELIVERY_THRESHOLD=500
NEXT_PUBLIC_DYNAMIC_HOMEPAGE=true
REVALIDATION_TIME=60
```

### apps/admin `.env`
```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
CLIENT_URL=http://localhost:3000
```

### What to Delete
- All `MONGO_URI` references
- All Firebase env vars (`FIREBASE_API_KEY`, `FIREBASE_AUTH_DOMAIN`, etc.)
- All `JWT_SECRET`, `JWT_EXPIRE`, `JWT_REFRESH_EXPIRE`
- `PORT` (no Express server to run)

---

## 11. Execution Checklist

### Phase 1 — Database Setup
- [ ] Create Supabase project
- [ ] Run SQL: extensions
- [ ] Run SQL: all enum types
- [ ] Run SQL: `update_updated_at()` function
- [ ] Run SQL: users table + trigger
- [ ] Run SQL: addresses table
- [ ] Run SQL: brands table
- [ ] Run SQL: product_types table
- [ ] Run SQL: categories table + triggers
- [ ] Run SQL: sellers table
- [ ] Run SQL: products table + triggers
- [ ] Run SQL: product_reviews, product_ratings, product_views
- [ ] Run SQL: cart_items, wishlist_items
- [ ] Run SQL: orders, order_items, order_status_history
- [ ] Run SQL: cash_collections
- [ ] Run SQL: suppliers, purchases, purchase_items, purchase_status_history
- [ ] Run SQL: notifications, subscriptions, contacts
- [ ] Run SQL: banners, ads_banners, product_banners
- [ ] Run SQL: website_config, website_icons, base_config, social_media
- [ ] Run SQL: component_types, user_roles, permissions, role_permissions
- [ ] Verify all tables created in Supabase Table Editor

### Phase 2 — Auth Setup
- [ ] Enable Email Auth provider
- [ ] Enable Google OAuth provider (add Client ID + Secret)
- [ ] Enable GitHub OAuth provider (add Client ID + Secret)
- [ ] Set site URL and redirect URLs
- [ ] Deploy `custom_access_token_hook` function
- [ ] Register hook in Dashboard → Auth → Hooks
- [ ] Test signup with email
- [ ] Test Google OAuth
- [ ] Verify trigger creates row in `public.users` on signup

### Phase 3 — RLS
- [ ] Deploy helper functions (`get_user_role`, `is_admin`, `is_staff`, `get_employee_role`)
- [ ] Enable RLS + add policies: users
- [ ] Enable RLS + add policies: addresses
- [ ] Enable RLS + add policies: products
- [ ] Enable RLS + add policies: cart_items, wishlist_items
- [ ] Enable RLS + add policies: orders, order_items, order_status_history
- [ ] Enable RLS + add policies: cash_collections
- [ ] Enable RLS + add policies: sellers
- [ ] Enable RLS + add policies: notifications
- [ ] Enable RLS + add policies: purchases, suppliers
- [ ] Enable RLS + add policies: content/config tables
- [ ] Test: regular user cannot see other users' orders
- [ ] Test: packer can only update their assigned orders
- [ ] Test: seller can only see own products
- [ ] Test: admin bypasses all restrictions

### Phase 4 — Edge Functions
- [ ] Initialize Supabase CLI (`pnpm add -g supabase`)
- [ ] `supabase init` in project root
- [ ] Create `stripe-webhook` edge function
- [ ] Create `sslcommerz-notify` edge function
- [ ] Create `order-workflow` edge function
- [ ] Create `send-email` edge function
- [ ] Create `upload-sign` edge function
- [ ] Create `analytics` edge function
- [ ] Create `search` edge function
- [ ] Set Edge Function secrets in Dashboard
- [ ] Deploy all edge functions: `supabase functions deploy`
- [ ] Update Stripe webhook URL in Stripe Dashboard to Edge Function URL
- [ ] Update SSLCommerz callback URL

### Phase 5 — Web App (apps/web)
- [ ] `pnpm add @supabase/supabase-js @supabase/ssr --filter=@entry/web`
- [ ] `pnpm remove firebase --filter=@entry/web`
- [ ] Create `apps/web/lib/supabase/client.ts`
- [ ] Create `apps/web/lib/supabase/server.ts`
- [ ] Create `apps/web/middleware.ts` (auth guard)
- [ ] Create `apps/web/app/auth/callback/route.ts`
- [ ] Update web Zustand auth store (replace Firebase with Supabase)
- [ ] Update `apps/web/.env` (remove Firebase + API_ENDPOINT, add Supabase vars)
- [ ] Replace Firebase login/register/OAuth calls in web
- [ ] Replace all `axios` API calls with Supabase client queries (web)
- [ ] Replace complex calls with `supabase.functions.invoke` (web)
- [ ] Test: register new user (web)
- [ ] Test: login with email/password (web)
- [ ] Test: Google OAuth (web)
- [ ] Test: forgot password email received
- [ ] Test: product listing + filtering
- [ ] Test: product search
- [ ] Test: add to cart + wishlist
- [ ] Test: checkout + Stripe payment
- [ ] Test: order history in account page

### Phase 6 — Admin App (apps/admin)
- [ ] `pnpm add @supabase/supabase-js --filter=@entry/admin`
- [ ] `pnpm remove firebase --filter=@entry/admin`
- [ ] Create `apps/admin/src/lib/supabase.ts`
- [ ] Create `apps/admin/src/lib/storage.ts` (Supabase Storage upload/delete)
- [ ] Create Supabase Storage buckets: products, categories, banners, avatars, icons
- [ ] Set Storage bucket RLS policies (public read, auth write/delete)
- [ ] Rewrite `apps/admin/src/store/useAuthStore.ts` (remove JWT/axios, use Supabase)
- [ ] Add `initAuthListener()` call in `main.tsx`
- [ ] Delete `src/lib/firebase.ts` (auth parts — keep nothing)
- [ ] Delete `src/lib/oauthService.ts`
- [ ] Delete `src/lib/config.ts` (axios instance)
- [ ] Delete `src/hooks/useAxiosPrivate.ts`
- [ ] Delete `src/store/apiDebugStore.ts`
- [ ] Delete `src/contexts/ApiDebugContext.tsx`
- [ ] Delete `src/components/debug/ApiDebugger.tsx`
- [ ] Create `apps/admin/src/pages/auth/CallbackPage.tsx`
- [ ] Add `/auth/callback` route in `App.tsx`
- [ ] Update `DashboardLayout.tsx` auth guard (Supabase session check)
- [ ] Update `apps/admin/.env` (remove Firebase + API URL, add Supabase vars)
- [ ] Replace all image uploads: `uploadToFirebase` → `uploadToSupabase` in all pages
- [ ] Migrate DashboardPage (stats queries)
- [ ] Migrate UsersPage (list, update role, delete)
- [ ] Migrate ProductsPage (list, create, update, approve, bulk-delete)
- [ ] Migrate CategoriesPage (tree, create, update, delete)
- [ ] Migrate BrandsPage
- [ ] Migrate ProductTypesPage
- [ ] Migrate Orders page (list, status workflow)
- [ ] Migrate BannersPage + AdsBannersPage + ProductBannersPage
- [ ] Migrate SellersPage + SellerProductsPage
- [ ] Migrate PurchasesPage + SuppliersPage
- [ ] Migrate WebsiteConfigPage + BaseConfigPage + SocialMediaPage
- [ ] Migrate NotificationsPage
- [ ] Migrate SearchPage
- [ ] Migrate AccountPage (avatar upload)
- [ ] Test: admin login with email
- [ ] Test: admin Google/GitHub OAuth
- [ ] Test: role-based sidebar (employee sees restricted menu)
- [ ] Test: packer can only access their assigned orders
- [ ] Test: product image upload (Supabase Storage)
- [ ] Test: category image upload
- [ ] Test: banner image upload + toggle active
- [ ] Test: seller approval flow
- [ ] Test: order workflow (pending → confirmed → packed → delivered)
- [ ] Test: read-only user cannot create/edit/delete

### Phase 7 — Data Migration
- [ ] Add migration script dependencies
- [ ] Write `01-users.ts` migration
- [ ] Write `02-categories.ts` migration (root first, then children by level)
- [ ] Write `03-brands.ts` migration
- [ ] Write `04-product-types.ts` migration
- [ ] Write `05-sellers.ts` migration
- [ ] Write `06-products.ts` migration
- [ ] Write `07-orders.ts` migration (items + status history)
- [ ] Write `08-cart-wishlist.ts` migration
- [ ] Write `09-notifications.ts` migration
- [ ] Write `10-banners.ts` migration
- [ ] Write `11-config.ts` migration
- [ ] Dry-run migration against empty Supabase DB
- [ ] Verify row counts match MongoDB counts
- [ ] Verify all foreign keys resolve
- [ ] Verify product slugs generated correctly
- [ ] Verify category hierarchy `path` and `level` fields correct
- [ ] Migrate Firebase Storage images → Supabase Storage (use URL-copy script)
- [ ] Run full migration on production Supabase DB

### Final Cleanup
- [ ] Archive or delete `apps/api` Express server
- [ ] Remove `@entry/api` from `turbo.json` pipeline filters
- [ ] Update root `package.json` dev scripts (remove api filter)
- [ ] Update `pnpm-workspace.yaml` if `apps/api` removed
- [ ] Remove Firebase project (optional — after confirming all images migrated)
- [ ] Final smoke test: web storefront end-to-end
- [ ] Final smoke test: admin dashboard end-to-end
- [ ] Final smoke test: Stripe webhook receives payment and updates order
- [ ] Deploy web to Vercel
- [ ] Deploy admin to Vercel
- [ ] Set production env vars in Vercel dashboard

---

*This document is the single source of truth for the Supabase migration. Work through phases in order. Each phase is independently testable before moving to the next.*
