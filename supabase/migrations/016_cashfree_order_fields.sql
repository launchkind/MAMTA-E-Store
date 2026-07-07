-- Migration 016: Cashfree order fields

alter table public.orders
  add column cashfree_order_id         text,
  add column cashfree_payment_id       text,
  add column cashfree_payment_session_id text,
  add column cashfree_payment_method   text,
  add column cashfree_bank_reference   text;

alter table public.orders alter column payment_method set default 'cashfree';
