-- Migration 014: Allow customers to update their own orders
--
-- The success page (after Stripe checkout) updates the order's payment_status
-- from the customer's session. Without this policy that update silently
-- matches 0 rows and payment status stays "pending" forever.

create policy "orders_own_update" on public.orders
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
