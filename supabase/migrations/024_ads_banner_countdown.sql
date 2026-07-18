-- Migration 024: Add countdown end time to ads_banners
-- Lets the admin set a real countdown end date/time for the homepage
-- sidebar flash-deal banner (AdsSideBanner), instead of a hardcoded timer.

alter table public.ads_banners
  add column end_time timestamptz;
