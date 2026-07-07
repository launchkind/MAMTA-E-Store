-- Migration 009: Suppliers and Purchases

-- ─── Suppliers ────────────────────────────────────────────────────────────────

create table public.suppliers (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  contact    text,
  email      text,
  phone      text,
  address    text,
  notes      text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger suppliers_updated_at before update on public.suppliers
  for each row execute procedure public.update_updated_at();

alter table public.suppliers enable row level security;
create policy "suppliers_staff_all" on public.suppliers for all using (public.is_staff() or public.is_admin());

-- ─── Purchases ────────────────────────────────────────────────────────────────

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

-- Auto-generate purchase number
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

-- ─── Purchase Items ───────────────────────────────────────────────────────────

create table public.purchase_items (
  id             uuid primary key default uuid_generate_v4(),
  purchase_id    uuid not null references public.purchases(id) on delete cascade,
  product_id     uuid not null references public.products(id),
  product_name   text not null,
  quantity       integer not null check (quantity >= 1),
  purchase_price numeric(12,2) not null check (purchase_price >= 0),
  profit_margin  numeric(5,2)  not null default 0 check (profit_margin >= 0 and profit_margin <= 100),
  selling_price  numeric(12,2) not null check (selling_price >= 0),
  total_cost     numeric(12,2) not null check (total_cost >= 0)
);

create index idx_purchase_items_purchase_id on public.purchase_items(purchase_id);

-- Recalculate purchase total when items change
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

-- ─── Purchase Status History ──────────────────────────────────────────────────

create table public.purchase_status_history (
  id              uuid primary key default uuid_generate_v4(),
  purchase_id     uuid not null references public.purchases(id) on delete cascade,
  status          purchase_status not null,
  changed_by      uuid not null references public.users(id),
  changed_by_name text not null,
  notes           text default '',
  changed_at      timestamptz not null default now()
);

-- RLS
alter table public.purchases               enable row level security;
alter table public.purchase_items          enable row level security;
alter table public.purchase_status_history enable row level security;

create policy "purchases_staff_all"         on public.purchases               for all using (public.is_staff() or public.is_admin());
create policy "purchase_items_staff_all"    on public.purchase_items          for all using (public.is_staff() or public.is_admin());
create policy "purchase_history_staff_all"  on public.purchase_status_history for all using (public.is_staff() or public.is_admin());
