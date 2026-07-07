-- Migration 008: Cash Collections (COD workflow)

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

create index idx_cash_collected_by on public.cash_collections(collected_by, status);
create index idx_cash_order_id     on public.cash_collections(order_id);

create trigger cash_collections_updated_at before update on public.cash_collections
  for each row execute procedure public.update_updated_at();

-- RLS
alter table public.cash_collections enable row level security;

create policy "cash_deliveryman_own"    on public.cash_collections for select using (collected_by = auth.uid());
create policy "cash_accounts_read"      on public.cash_collections for select using (
  public.get_employee_role() in ('accounts', 'incharge') or public.is_admin()
);
create policy "cash_deliveryman_insert" on public.cash_collections for insert with check (
  public.get_employee_role() in ('deliveryman', 'incharge') and collected_by = auth.uid()
);
create policy "cash_deliveryman_submit" on public.cash_collections for update using (
  collected_by = auth.uid() and status = 'collected'
);
create policy "cash_accounts_confirm"   on public.cash_collections for update using (
  public.get_employee_role() in ('accounts', 'incharge') and status = 'submitted'
);
create policy "cash_admin_all"          on public.cash_collections for all using (public.is_admin());
