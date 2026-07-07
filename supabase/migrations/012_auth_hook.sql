-- Migration 012: Custom Access Token Hook
-- Injects user_role and employee_role into JWT claims
--
-- After running this SQL:
-- 1. Go to Supabase Dashboard → Authentication → Hooks → Custom Access Token
-- 2. Select the function: public.custom_access_token_hook

-- Grant supabase_auth_admin read access to public.users so the hook can query it
grant select on public.users to supabase_auth_admin;

create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb language plpgsql stable
-- SECURITY DEFINER is required so the hook bypasses RLS when reading public.users
security definer set search_path = public
as $$
declare
  claims        jsonb;
  user_role_val text;
  emp_role_val  text;
begin
  select role::text, employee_role::text
    into user_role_val, emp_role_val
    from public.users
   where id = (event->>'user_id')::uuid;

  claims := event->'claims';
  claims := jsonb_set(claims, '{user_role}',   to_jsonb(coalesce(user_role_val, 'user')));

  if emp_role_val is not null then
    claims := jsonb_set(claims, '{employee_role}', to_jsonb(emp_role_val));
  end if;

  return jsonb_set(event, '{claims}', claims);

exception when others then
  -- Never let a hook error block login — fall back to the unmodified event
  return event;
end;
$$;

grant execute on function public.custom_access_token_hook to supabase_auth_admin;
revoke execute on function public.custom_access_token_hook from authenticated, anon, public;
