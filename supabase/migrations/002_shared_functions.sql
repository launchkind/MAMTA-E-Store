-- Migration 002: Shared trigger functions used across all tables

create or replace function public.update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Helper functions for RLS (reads role from JWT custom claims)
create or replace function public.get_user_role()
returns text language sql stable as $$
  select coalesce(auth.jwt()->>'user_role', 'user')
$$;

create or replace function public.get_employee_role()
returns text language sql stable as $$
  select auth.jwt()->>'employee_role'
$$;

create or replace function public.is_admin()
returns boolean language sql stable as $$
  select public.get_user_role() = 'admin'
$$;

create or replace function public.is_staff()
returns boolean language sql stable as $$
  select public.get_user_role() in ('admin', 'employee')
$$;
