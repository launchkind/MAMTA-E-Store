-- Migration 006: Cart and Wishlist

create table public.cart_items (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity   integer not null default 1 check (quantity >= 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, product_id)
);

create table public.wishlist_items (
  user_id    uuid not null references public.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create index idx_cart_items_user_id     on public.cart_items(user_id);
create index idx_wishlist_items_user_id on public.wishlist_items(user_id);

create trigger cart_items_updated_at before update on public.cart_items
  for each row execute procedure public.update_updated_at();

-- RLS
alter table public.cart_items    enable row level security;
alter table public.wishlist_items enable row level security;

create policy "cart_own"     on public.cart_items    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "wishlist_own" on public.wishlist_items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
