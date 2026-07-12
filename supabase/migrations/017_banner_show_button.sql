-- Migration 017: Add show_button toggle to banners
-- Lets admins hide the "Shop Now" CTA on a banner. When hidden, the web app
-- makes the whole banner slide clickable (redirecting to `link`) instead.

alter table public.banners
  add column show_button boolean not null default true;
