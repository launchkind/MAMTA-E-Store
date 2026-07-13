-- Migration 021: Product Variants (color / storage-RAM)

create table public.product_variants (
  id         uuid primary key default uuid_generate_v4(),
  product_id uuid not null references public.products(id) on delete cascade,
  color      text,
  storage    text,
  price      numeric(12,2),
  stock      integer not null default 0 check (stock >= 0),
  images     text[] default '{}',
  sku        text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, color, storage)
);

create index idx_product_variants_product_id on public.product_variants(product_id);

create trigger product_variants_updated_at before update on public.product_variants
  for each row execute procedure public.update_updated_at();

alter table public.product_variants enable row level security;

create policy "product_variants_public_read" on public.product_variants
  for select using (
    exists (
      select 1 from public.products
      where id = product_variants.product_id and approval_status = 'approved'
    )
  );

create policy "product_variants_staff_read" on public.product_variants
  for select using (public.is_staff());

create policy "product_variants_admin_all" on public.product_variants
  for all using (public.is_admin());

-- ─── Cart: allow a variant to be selected per line ───────────────────────────

alter table public.cart_items add column variant_id uuid references public.product_variants(id) on delete cascade;
alter table public.cart_items drop constraint cart_items_user_id_product_id_key;
alter table public.cart_items add constraint cart_items_user_id_product_id_variant_id_key unique (user_id, product_id, variant_id);

-- ─── Order items: snapshot which variant was purchased ───────────────────────

alter table public.order_items add column variant_id uuid references public.product_variants(id);
alter table public.order_items add column variant_label text;
