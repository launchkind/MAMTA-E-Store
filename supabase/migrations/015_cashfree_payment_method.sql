-- Migration 015: Add Cashfree as a payment method (replacing Stripe as the primary gateway)
-- Must run in its own transaction — a new enum value cannot be used until committed.

alter type payment_method add value 'cashfree';
