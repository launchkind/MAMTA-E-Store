-- Migration 007: Orders, Order Items, Order Status History

create table public.orders (
  id                   uuid primary key default uuid_generate_v4(),
  user_id              uuid not null references public.users(id),
  total                numeric(12,2) not null default 0,
  status               order_status not null default 'pending',
  payment_status       payment_status not null default 'pending',
  payment_method       payment_method not null default 'stripe',

  -- Shipping address snapshot
  shipping_street      text not null,
  shipping_city        text not null,
  shipping_state       text not null,
  shipping_country     text not null,
  shipping_postal_code text not null,

  -- Stripe
  stripe_payment_intent_id text,
  stripe_session_id        text,
  stripe_payment_method    text,
  stripe_card_brand        text,
  stripe_card_last4        text,
  stripe_receipt_url       text,
  stripe_charge_id         text,

  -- SSLCommerz
  ssl_transaction_id   text,
  ssl_validation_id    text,
  ssl_bank_tran_id     text,
  ssl_card_type        text,
  ssl_card_issuer      text,
  ssl_card_brand       text,
  ssl_payment_method   text,
  ssl_mobile_provider  text,
  ssl_amount           numeric(12,2),
  ssl_currency         text,

  -- Common payment
  paid_amount  numeric(12,2),
  currency     text default 'BDT',
  paid_at      timestamptz,

  -- COD
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

create index idx_orders_user_id       on public.orders(user_id);
create index idx_orders_status        on public.orders(status);
create index idx_orders_payment_status on public.orders(payment_status);
create index idx_orders_created_at    on public.orders(created_at desc);

create trigger orders_updated_at before update on public.orders
  for each row execute procedure public.update_updated_at();

-- ─── Order Items ──────────────────────────────────────────────────────────────

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

-- ─── Order Status History ─────────────────────────────────────────────────────

create table public.order_status_history (
  id              uuid primary key default uuid_generate_v4(),
  order_id        uuid not null references public.orders(id) on delete cascade,
  status          order_status not null,
  changed_by      uuid not null references public.users(id),
  changed_by_name text not null,
  notes           text default '',
  changed_at      timestamptz not null default now()
);

create index idx_order_status_history_order_id on public.order_status_history(order_id);

-- ─── RLS ──────────────────────────────────────────────────────────────────────

alter table public.orders              enable row level security;
alter table public.order_items         enable row level security;
alter table public.order_status_history enable row level security;

-- Orders
create policy "orders_own_read"          on public.orders for select using (auth.uid() = user_id);
create policy "orders_own_insert"        on public.orders for insert with check (auth.uid() = user_id);
create policy "orders_admin_all"         on public.orders for all using (public.is_admin());
create policy "orders_staff_read"        on public.orders for select using (public.is_staff());
create policy "orders_packer_update"     on public.orders for update using (
  public.get_employee_role() in ('packer', 'incharge') and assigned_packer = auth.uid()
);
create policy "orders_deliveryman_update" on public.orders for update using (
  public.get_employee_role() in ('deliveryman', 'incharge') and assigned_deliveryman = auth.uid()
);

-- Order items (visibility follows the order)
create policy "order_items_read" on public.order_items
  for select using (
    exists (
      select 1 from public.orders
      where id = order_items.order_id
        and (user_id = auth.uid() or public.is_staff())
    )
  );
create policy "order_items_insert" on public.order_items for insert with check (true);

-- Order history
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
