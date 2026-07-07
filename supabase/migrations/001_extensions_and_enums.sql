-- Migration 001: Extensions and Enum Types
-- Run this first before any table creation

create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

create type user_role as enum ('admin', 'user', 'employee', 'seller');
create type employee_role as enum ('packer', 'deliveryman', 'accounts', 'incharge', 'call_center');
create type auth_provider as enum ('local', 'google', 'github');
create type approval_status as enum ('pending', 'approved', 'rejected');
create type order_status as enum (
  'pending', 'address_confirmed', 'confirmed',
  'packed', 'delivering', 'delivered', 'completed', 'cancelled'
);
create type payment_status as enum ('pending', 'paid', 'failed', 'refunded', 'cod_collected');
create type payment_method as enum ('stripe', 'sslcommerz', 'cod');
create type cash_collection_status as enum ('collected', 'submitted', 'confirmed');
create type purchase_status as enum ('requisition', 'approved', 'purchased', 'received', 'cancelled');
create type seller_status as enum ('pending', 'approved', 'rejected');
create type category_type as enum ('Featured', 'Hot Categories', 'Top Categories');
create type notification_type as enum (
  'order_placed', 'order_confirmed', 'order_packed',
  'order_delivering', 'order_delivered', 'order_completed',
  'order_cancelled', 'payment_success', 'payment_failed',
  'general', 'promotion'
);
create type notification_priority as enum ('low', 'normal', 'high', 'urgent');
