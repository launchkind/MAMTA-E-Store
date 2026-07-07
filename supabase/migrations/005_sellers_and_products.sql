-- Migration 005: Sellers and Products

-- ─── Sellers ─────────────────────────────────────────────────────────────────

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
create index idx_sellers_status  on public.sellers(status);

create trigger sellers_updated_at before update on public.sellers
  for each row execute procedure public.update_updated_at();

alter table public.sellers enable row level security;
create policy "sellers_public_approved_read" on public.sellers for select using (status = 'approved');
create policy "sellers_own_read"   on public.sellers for select using (user_id = auth.uid());
create policy "sellers_own_update" on public.sellers for update using (user_id = auth.uid());
create policy "sellers_insert"     on public.sellers for insert with check (auth.uid() = user_id and status = 'pending');
create policy "sellers_admin_all"  on public.sellers for all using (public.is_admin());

-- ─── Products ─────────────────────────────────────────────────────────────────

create table public.products (
  id                  uuid primary key default uuid_generate_v4(),
  name                text not null unique,
  slug                text unique,
  description         text not null,
  about_items         text[] default '{}',
  price               numeric(12,2) not null default 0,
  purchase_price      numeric(12,2) not null default 0,
  profit_margin       numeric(5,2)  default 0 check (profit_margin >= 0 and profit_margin <= 100),
  discount_percentage numeric(5,2)  default 0 check (discount_percentage >= 0 and discount_percentage <= 100),
  stock               integer not null default 0  check (stock >= 0),
  sold                integer not null default 0  check (sold >= 0),
  average_rating      numeric(3,2)  default 0,
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

-- Junction: product ↔ product_types (many-to-many)
create table public.product_product_types (
  product_id      uuid not null references public.products(id) on delete cascade,
  product_type_id uuid not null references public.product_types(id) on delete cascade,
  primary key (product_id, product_type_id)
);

create index idx_products_category_id      on public.products(category_id);
create index idx_products_brand_id         on public.products(brand_id);
create index idx_products_seller_id        on public.products(seller_id);
create index idx_products_approval_status  on public.products(approval_status);
create index idx_products_slug             on public.products(slug);
create index idx_products_name_trgm        on public.products using gin(name gin_trgm_ops);

-- Auto-generate slug and keep image/images in sync
create or replace function public.generate_product_slug()
returns trigger language plpgsql as $$
declare
  base_slug  text;
  final_slug text;
  counter    integer := 1;
begin
  if new.slug is null or new.slug = '' or (tg_op = 'UPDATE' and new.name != old.name) then
    base_slug  := trim(both '-' from lower(regexp_replace(new.name, '[^a-z0-9]+', '-', 'gi')));
    final_slug := base_slug;
    while exists (select 1 from public.products where slug = final_slug and id != new.id) loop
      final_slug := base_slug || '-' || counter;
      counter    := counter + 1;
    end loop;
    new.slug := final_slug;
  end if;
  -- Keep image and images[] in sync
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

-- RLS
alter table public.products enable row level security;

create policy "products_public_approved_read" on public.products
  for select using (approval_status = 'approved');

create policy "products_staff_read" on public.products
  for select using (public.is_staff());

create policy "products_seller_own_read" on public.products
  for select using (
    public.get_user_role() = 'seller' and
    seller_id = (select id from public.sellers where user_id = auth.uid())
  );

create policy "products_admin_all" on public.products
  for all using (public.is_admin());

create policy "products_seller_insert" on public.products
  for insert with check (
    public.get_user_role() = 'seller' and
    seller_id = (select id from public.sellers where user_id = auth.uid()) and
    approval_status = 'pending'
  );

create policy "products_seller_update_own" on public.products
  for update using (
    public.get_user_role() = 'seller' and
    seller_id = (select id from public.sellers where user_id = auth.uid())
  );

-- ─── Reviews & Ratings ────────────────────────────────────────────────────────

create table public.product_reviews (
  id         uuid primary key default uuid_generate_v4(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id    uuid not null references public.users(id) on delete cascade,
  user_name  text not null,
  rating     integer not null check (rating >= 1 and rating <= 5),
  comment    text not null,
  is_approved boolean not null default false,
  created_at timestamptz not null default now(),
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

create index idx_product_reviews_product_id  on public.product_reviews(product_id);
create index idx_product_reviews_is_approved on public.product_reviews(is_approved);
create index idx_product_views_product_id    on public.product_views(product_id);

-- Recalculate average_rating + num_reviews after any review change
create or replace function public.update_product_rating_stats()
returns trigger language plpgsql as $$
declare
  pid    uuid;
  avg_r  numeric;
  cnt    integer;
begin
  pid := coalesce(new.product_id, old.product_id);
  select coalesce(avg(rating), 0), count(*)
    into avg_r, cnt
    from public.product_reviews
   where product_id = pid and is_approved = true;

  update public.products set average_rating = round(avg_r, 2), num_reviews = cnt where id = pid;
  return coalesce(new, old);
end;
$$;

create trigger product_rating_update
  after insert or update or delete on public.product_reviews
  for each row execute procedure public.update_product_rating_stats();

-- RLS
alter table public.product_reviews enable row level security;
create policy "reviews_public_read"    on public.product_reviews for select using (is_approved = true);
create policy "reviews_staff_read"     on public.product_reviews for select using (public.is_staff());
create policy "reviews_own_insert"     on public.product_reviews for insert with check (auth.uid() = user_id);
create policy "reviews_admin_all"      on public.product_reviews for all using (public.is_admin());

alter table public.product_ratings enable row level security;
create policy "ratings_own"            on public.product_ratings for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table public.product_views enable row level security;
create policy "views_insert_all"       on public.product_views for insert with check (true);
create policy "views_staff_read"       on public.product_views for select using (public.is_staff());
