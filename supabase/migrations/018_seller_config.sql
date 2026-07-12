-- Migration 018: Seller/vendor configuration
-- Replaces the fake "Premium" placeholder on the Seller Config admin page
-- with real, working settings: platform-wide commission defaults, payout
-- rules, seller application requirements, and per-category commission
-- overrides.


create table public.seller_config (
  id                    uuid primary key default uuid_generate_v4(),
  default_commission_pct numeric(5,2) not null default 10,
  min_payout_amount     numeric(12,2) not null default 0,
  payout_schedule       text not null default 'monthly',
  auto_approve_sellers  boolean not null default false,
  seller_requirements   text default '',
  updated_at            timestamptz not null default now()
);

create table public.category_commission_rules (
  id             uuid primary key default uuid_generate_v4(),
  category_id    uuid not null references public.categories(id) on delete cascade,
  commission_pct numeric(5,2) not null default 10,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (category_id)
);

create index idx_category_commission_rules_category_id on public.category_commission_rules(category_id);

create trigger seller_config_updated_at before update on public.seller_config
  for each row execute procedure public.update_updated_at();

create trigger category_commission_rules_updated_at before update on public.category_commission_rules
  for each row execute procedure public.update_updated_at();

alter table public.seller_config enable row level security;
alter table public.category_commission_rules enable row level security;

create policy "seller_config_public_read" on public.seller_config for select using (true);
create policy "seller_config_admin_write" on public.seller_config for all using (public.is_admin());

create policy "category_commission_rules_public_read" on public.category_commission_rules for select using (true);
create policy "category_commission_rules_admin_write" on public.category_commission_rules for all using (public.is_admin());
