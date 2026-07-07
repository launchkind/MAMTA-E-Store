-- Migration 010: Notifications, Subscriptions, Contacts

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

alter table public.notifications enable row level security;
create policy "notifications_own"           on public.notifications for all    using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "notifications_staff_insert"  on public.notifications for insert with check (public.is_staff() or public.is_admin());

-- ─── Subscriptions ────────────────────────────────────────────────────────────

create table public.subscriptions (
  id                uuid primary key default uuid_generate_v4(),
  email             text not null unique,
  source            text,
  pref_newsletter   boolean not null default true,
  pref_promotions   boolean not null default true,
  pref_new_products boolean not null default true,
  status            text not null default 'active' check (status in ('active', 'unsubscribed')),
  subscribed_at     timestamptz not null default now()
);

alter table public.subscriptions enable row level security;
create policy "subscriptions_public_insert" on public.subscriptions for insert with check (true);
create policy "subscriptions_admin_all"     on public.subscriptions for all using (public.is_admin());

-- ─── Contact Submissions ──────────────────────────────────────────────────────

create table public.contacts (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  email      text not null,
  subject    text,
  message    text not null,
  created_at timestamptz not null default now()
);

alter table public.contacts enable row level security;
create policy "contacts_public_insert" on public.contacts for insert with check (true);
create policy "contacts_admin_read"    on public.contacts for select using (public.is_admin());
