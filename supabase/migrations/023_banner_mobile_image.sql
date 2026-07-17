-- Migration 023: Add optional mobile-specific image to banners
-- Lets admins upload a separate banner image tailored for mobile screens.
-- Falls back to the main `image` on the web app when not set.

alter table public.banners
  add column mobile_image text;
