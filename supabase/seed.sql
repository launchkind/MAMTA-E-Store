-- =============================================================================
-- SEED FILE — Run this AFTER all 012 migrations
-- Populates: brands, product_types, categories, products, banners, website_config
-- UUID legend:
--   brands       00000000-0000-0000-0001-0000000000XX  (XX = 01-10)
--   product_types 00000000-0000-0000-0002-0000000000XX (XX = 01-05)
--   categories L0 00000000-0000-0000-0003-0000000000XX (XX = 01-05)
--   categories L1 00000000-0000-0000-0004-0000000000XX (XX = 01-13)
--   products      00000000-0000-0000-0005-0000000000XX (XX = 01-15)
-- =============================================================================

begin;

-- =============================================================================
-- 1. BRANDS
-- =============================================================================
insert into public.brands (id, name) values
  ('00000000-0000-0000-0001-000000000001', 'Samsung'),
  ('00000000-0000-0000-0001-000000000002', 'Apple'),
  ('00000000-0000-0000-0001-000000000003', 'Sony'),
  ('00000000-0000-0000-0001-000000000004', 'Nike'),
  ('00000000-0000-0000-0001-000000000005', 'Adidas'),
  ('00000000-0000-0000-0001-000000000006', 'IKEA'),
  ('00000000-0000-0000-0001-000000000007', 'Puma'),
  ('00000000-0000-0000-0001-000000000008', 'LG'),
  ('00000000-0000-0000-0001-000000000009', 'Xiaomi'),
  ('00000000-0000-0000-0001-000000000010', 'Generic')
on conflict (name) do nothing;

-- =============================================================================
-- 2. PRODUCT TYPES
-- =============================================================================
insert into public.product_types (id, name, type, description, color) values
  ('00000000-0000-0000-0002-000000000001', 'Electronics', 'electronics', 'Electronic gadgets and devices', '#3B82F6'),
  ('00000000-0000-0000-0002-000000000002', 'Clothing',    'clothing',    'Apparel and fashion items',      '#EC4899'),
  ('00000000-0000-0000-0002-000000000003', 'Home',        'home',        'Home and kitchen products',      '#10B981'),
  ('00000000-0000-0000-0002-000000000004', 'Sports',      'sports',      'Sports and fitness equipment',   '#F59E0B'),
  ('00000000-0000-0000-0002-000000000005', 'Books',       'books',       'Books and educational material',  '#8B5CF6')
on conflict (type) do nothing;

-- =============================================================================
-- 3. CATEGORIES  (parent categories first, then children)
-- =============================================================================

-- Level 0 — root categories
insert into public.categories (id, name, sort_order, is_active, category_type) values
  ('00000000-0000-0000-0003-000000000001', 'Electronics',   1, true, array['Featured','Hot Categories']::category_type[]),
  ('00000000-0000-0000-0003-000000000002', 'Clothing',      2, true, array['Featured','Top Categories']::category_type[]),
  ('00000000-0000-0000-0003-000000000003', 'Home & Kitchen', 3, true, array['Featured']::category_type[]),
  ('00000000-0000-0000-0003-000000000004', 'Sports',        4, true, array['Hot Categories']::category_type[]),
  ('00000000-0000-0000-0003-000000000005', 'Books',         5, true, null)
on conflict (id) do nothing;

-- Level 1 — sub-categories (triggers auto-fill path + level)
insert into public.categories (id, name, parent_id, sort_order, is_active) values
  -- Electronics
  ('00000000-0000-0000-0004-000000000001', 'Smartphones',   '00000000-0000-0000-0003-000000000001', 1, true),
  ('00000000-0000-0000-0004-000000000002', 'Laptops',       '00000000-0000-0000-0003-000000000001', 2, true),
  ('00000000-0000-0000-0004-000000000003', 'Tablets',       '00000000-0000-0000-0003-000000000001', 3, true),
  ('00000000-0000-0000-0004-000000000004', 'Audio',         '00000000-0000-0000-0003-000000000001', 4, true),
  ('00000000-0000-0000-0004-000000000005', 'TVs',           '00000000-0000-0000-0003-000000000001', 5, true),
  -- Clothing
  ('00000000-0000-0000-0004-000000000006', 'Men''s Wear',   '00000000-0000-0000-0003-000000000002', 1, true),
  ('00000000-0000-0000-0004-000000000007', 'Women''s Wear', '00000000-0000-0000-0003-000000000002', 2, true),
  ('00000000-0000-0000-0004-000000000008', 'Kids'' Wear',   '00000000-0000-0000-0003-000000000002', 3, true),
  -- Home & Kitchen
  ('00000000-0000-0000-0004-000000000009', 'Furniture',     '00000000-0000-0000-0003-000000000003', 1, true),
  ('00000000-0000-0000-0004-000000000010', 'Appliances',    '00000000-0000-0000-0003-000000000003', 2, true),
  ('00000000-0000-0000-0004-000000000011', 'Kitchenware',   '00000000-0000-0000-0003-000000000003', 3, true),
  -- Sports
  ('00000000-0000-0000-0004-000000000012', 'Footwear',      '00000000-0000-0000-0003-000000000004', 1, true),
  ('00000000-0000-0000-0004-000000000013', 'Gym Equipment', '00000000-0000-0000-0003-000000000004', 2, true)
on conflict (id) do nothing;

-- =============================================================================
-- 4. PRODUCTS
-- =============================================================================
insert into public.products (
  id, name, description, about_items,
  price, purchase_price, profit_margin, discount_percentage,
  stock, image, images,
  category_id, brand_id,
  approval_status
) values

-- ── Smartphones ───────────────────────────────────────────────────────────────
(
  '00000000-0000-0000-0005-000000000001',
  'Samsung Galaxy S24',
  'The Samsung Galaxy S24 features a 6.2-inch Dynamic AMOLED display, Snapdragon 8 Gen 3 processor, 50MP triple camera system, and 4000mAh battery.',
  array['6.2-inch Dynamic AMOLED 2X display','50MP triple camera','Snapdragon 8 Gen 3','4000mAh battery','8GB RAM / 128GB storage'],
  799.99, 600.00, 25.00, 10.00, 50,
  'https://picsum.photos/seed/galaxy-s24/600/600',
  array['https://picsum.photos/seed/galaxy-s24/600/600','https://picsum.photos/seed/galaxy-s24b/600/600'],
  '00000000-0000-0000-0004-000000000001', '00000000-0000-0000-0001-000000000001',
  'approved'
),
(
  '00000000-0000-0000-0005-000000000002',
  'Apple iPhone 15 Pro',
  'iPhone 15 Pro with titanium design, A17 Pro chip, Pro camera system with 48MP main sensor, and USB-C connectivity.',
  array['Titanium design','A17 Pro chip','48MP main camera','USB-C connector','Action button'],
  1099.99, 820.00, 25.00, 5.00, 30,
  'https://picsum.photos/seed/iphone15pro/600/600',
  array['https://picsum.photos/seed/iphone15pro/600/600','https://picsum.photos/seed/iphone15prob/600/600'],
  '00000000-0000-0000-0004-000000000001', '00000000-0000-0000-0001-000000000002',
  'approved'
),
(
  '00000000-0000-0000-0005-000000000003',
  'Xiaomi Redmi Note 13',
  'Redmi Note 13 with 6.67-inch AMOLED display, 200MP camera, 5000mAh battery and 67W fast charging.',
  array['6.67-inch 120Hz AMOLED','200MP main camera','5000mAh battery','67W fast charging','8GB RAM'],
  249.99, 180.00, 28.00, 15.00, 100,
  'https://picsum.photos/seed/redminote13/600/600',
  array['https://picsum.photos/seed/redminote13/600/600'],
  '00000000-0000-0000-0004-000000000001', '00000000-0000-0000-0001-000000000009',
  'approved'
),

-- ── Laptops ──────────────────────────────────────────────────────────────────
(
  '00000000-0000-0000-0005-000000000004',
  'Samsung Galaxy Book 4 Pro',
  'Ultra-thin laptop with Intel Core Ultra 7, 16GB RAM, 512GB SSD, and a stunning 14-inch AMOLED display.',
  array['14-inch 2.8K AMOLED','Intel Core Ultra 7','16GB LPDDR5X RAM','512GB NVMe SSD','Up to 25hr battery'],
  1299.99, 950.00, 27.00, 8.00, 20,
  'https://picsum.photos/seed/galaxybook4/600/600',
  array['https://picsum.photos/seed/galaxybook4/600/600'],
  '00000000-0000-0000-0004-000000000002', '00000000-0000-0000-0001-000000000001',
  'approved'
),
(
  '00000000-0000-0000-0005-000000000005',
  'Apple MacBook Air M3',
  'MacBook Air with M3 chip — fanless design with up to 18 hours of battery and a brilliant 15-inch Liquid Retina display.',
  array['15-inch Liquid Retina display','Apple M3 chip','8GB unified memory','256GB SSD','18-hour battery'],
  1299.00, 950.00, 26.80, 0.00, 15,
  'https://picsum.photos/seed/macbookairm3/600/600',
  array['https://picsum.photos/seed/macbookairm3/600/600'],
  '00000000-0000-0000-0004-000000000002', '00000000-0000-0000-0001-000000000002',
  'approved'
),

-- ── Audio ─────────────────────────────────────────────────────────────────────
(
  '00000000-0000-0000-0005-000000000006',
  'Sony WH-1000XM5 Headphones',
  'Industry-leading noise cancelling headphones with 30-hour battery life and exceptional sound quality.',
  array['Industry-leading ANC','30-hour battery','Hi-Res Audio','Multipoint connection','Foldable design'],
  349.99, 240.00, 31.50, 12.00, 40,
  'https://picsum.photos/seed/sonyxm5/600/600',
  array['https://picsum.photos/seed/sonyxm5/600/600','https://picsum.photos/seed/sonyxm5b/600/600'],
  '00000000-0000-0000-0004-000000000004', '00000000-0000-0000-0001-000000000003',
  'approved'
),
(
  '00000000-0000-0000-0005-000000000007',
  'Samsung Galaxy Buds 3 Pro',
  'True wireless earbuds with intelligent ANC, 360 audio, and ergonomic design for all-day comfort.',
  array['Intelligent ANC','360 Audio','6-hour playtime + 18hr case','IPX7 water resistant','Blade LED indicator'],
  199.99, 140.00, 30.00, 0.00, 60,
  'https://picsum.photos/seed/galaxybuds3/600/600',
  array['https://picsum.photos/seed/galaxybuds3/600/600'],
  '00000000-0000-0000-0004-000000000004', '00000000-0000-0000-0001-000000000001',
  'approved'
),

-- ── TVs ───────────────────────────────────────────────────────────────────────
(
  '00000000-0000-0000-0005-000000000008',
  'LG OLED C3 55-inch TV',
  'LG OLED C3 with self-lit OLED pixels, Dolby Vision IQ, G-Sync Compatible gaming, and webOS 23.',
  array['55-inch OLED evo panel','4K 120Hz','Dolby Vision IQ + Atmos','G-Sync & FreeSync','webOS 23'],
  1299.99, 900.00, 30.80, 15.00, 12,
  'https://picsum.photos/seed/lgoled55/600/600',
  array['https://picsum.photos/seed/lgoled55/600/600'],
  '00000000-0000-0000-0004-000000000005', '00000000-0000-0000-0001-000000000008',
  'approved'
),

-- ── Men's Wear ────────────────────────────────────────────────────────────────
(
  '00000000-0000-0000-0005-000000000009',
  'Nike Dri-FIT Running T-Shirt',
  'Nike Dri-FIT technology wicks sweat away from your skin. Lightweight fabric with a standard fit.',
  array['Dri-FIT moisture-wicking fabric','Standard fit','Machine washable','100% polyester','Multiple colors'],
  35.00, 20.00, 42.86, 0.00, 200,
  'https://picsum.photos/seed/nikedrifit/600/600',
  array['https://picsum.photos/seed/nikedrifit/600/600'],
  '00000000-0000-0000-0004-000000000006', '00000000-0000-0000-0001-000000000004',
  'approved'
),
(
  '00000000-0000-0000-0005-000000000010',
  'Adidas Essentials 3-Stripes Hoodie',
  'Soft fleece hoodie with iconic 3-Stripes detailing, kangaroo pocket, and a regular fit.',
  array['Regular fit','Fleece fabric','Kangaroo pocket','Ribbed cuffs & hem','70% cotton 30% polyester'],
  65.00, 38.00, 41.54, 10.00, 150,
  'https://picsum.photos/seed/adidashoodie/600/600',
  array['https://picsum.photos/seed/adidashoodie/600/600'],
  '00000000-0000-0000-0004-000000000006', '00000000-0000-0000-0001-000000000005',
  'approved'
),

-- ── Women's Wear ──────────────────────────────────────────────────────────────
(
  '00000000-0000-0000-0005-000000000011',
  'Nike Women''s Yoga Pants',
  'High-waisted yoga pants with four-way stretch fabric and a flattering fit for any workout.',
  array['High waist','Four-way stretch','Hidden pocket','Squat proof','88% polyester 12% spandex'],
  55.00, 30.00, 45.45, 0.00, 120,
  'https://picsum.photos/seed/nikeyogapants/600/600',
  array['https://picsum.photos/seed/nikeyogapants/600/600'],
  '00000000-0000-0000-0004-000000000007', '00000000-0000-0000-0001-000000000004',
  'approved'
),

-- ── Furniture ─────────────────────────────────────────────────────────────────
(
  '00000000-0000-0000-0005-000000000012',
  'IKEA KALLAX Shelf Unit',
  'Versatile shelf unit that can be used as room divider or sideboard. Suitable for records, books or storage boxes.',
  array['Can be placed horizontally or vertically','Wall mountable','Suitable for 12 inch records','Max load: 13 kg per shelf','147x147 cm'],
  199.99, 120.00, 40.00, 0.00, 25,
  'https://picsum.photos/seed/ikeakallax/600/600',
  array['https://picsum.photos/seed/ikeakallax/600/600'],
  '00000000-0000-0000-0004-000000000009', '00000000-0000-0000-0001-000000000006',
  'approved'
),

-- ── Sports Footwear ───────────────────────────────────────────────────────────
(
  '00000000-0000-0000-0005-000000000013',
  'Nike Air Max 270',
  'Nike Air Max 270 features Nike''s biggest heel Air unit yet for an incredibly cushioned feel.',
  array['Largest heel Air unit','Mesh upper for breathability','Foam midsole','Rubber outsole','Sizes 6-15'],
  150.00, 85.00, 43.33, 20.00, 80,
  'https://picsum.photos/seed/nikeairmax270/600/600',
  array['https://picsum.photos/seed/nikeairmax270/600/600','https://picsum.photos/seed/nikeairmax270b/600/600'],
  '00000000-0000-0000-0004-000000000012', '00000000-0000-0000-0001-000000000004',
  'approved'
),
(
  '00000000-0000-0000-0005-000000000014',
  'Adidas Ultraboost 23',
  'Responsive Boost midsole and Primeknit upper adapt to your foot for a personalized fit.',
  array['Primeknit+ upper','Boost midsole','Continental rubber outsole','Linear Energy Push system','Recycled content'],
  189.99, 110.00, 42.11, 0.00, 60,
  'https://picsum.photos/seed/adidasultraboost/600/600',
  array['https://picsum.photos/seed/adidasultraboost/600/600'],
  '00000000-0000-0000-0004-000000000012', '00000000-0000-0000-0001-000000000005',
  'approved'
),

-- ── Gym Equipment ─────────────────────────────────────────────────────────────
(
  '00000000-0000-0000-0005-000000000015',
  'Puma Training Dumbbell Set 10kg',
  'Rubber-coated dumbbell set to protect floors and reduce noise. Perfect for home strength training.',
  array['Rubber coated','10kg total (2x5kg)','Ergonomic grip','Floor-friendly design','Great for home workouts'],
  49.99, 28.00, 44.00, 5.00, 75,
  'https://picsum.photos/seed/pumadumbbells/600/600',
  array['https://picsum.photos/seed/pumadumbbells/600/600'],
  '00000000-0000-0000-0004-000000000013', '00000000-0000-0000-0001-000000000007',
  'approved'
)

on conflict (name) do nothing;

-- =============================================================================
-- 5. PRODUCT ↔ PRODUCT TYPE links
-- =============================================================================
insert into public.product_product_types (product_id, product_type_id) values
  ('00000000-0000-0000-0005-000000000001', '00000000-0000-0000-0002-000000000001'),
  ('00000000-0000-0000-0005-000000000002', '00000000-0000-0000-0002-000000000001'),
  ('00000000-0000-0000-0005-000000000003', '00000000-0000-0000-0002-000000000001'),
  ('00000000-0000-0000-0005-000000000004', '00000000-0000-0000-0002-000000000001'),
  ('00000000-0000-0000-0005-000000000005', '00000000-0000-0000-0002-000000000001'),
  ('00000000-0000-0000-0005-000000000006', '00000000-0000-0000-0002-000000000001'),
  ('00000000-0000-0000-0005-000000000007', '00000000-0000-0000-0002-000000000001'),
  ('00000000-0000-0000-0005-000000000008', '00000000-0000-0000-0002-000000000001'),
  ('00000000-0000-0000-0005-000000000009', '00000000-0000-0000-0002-000000000002'),
  ('00000000-0000-0000-0005-000000000010', '00000000-0000-0000-0002-000000000002'),
  ('00000000-0000-0000-0005-000000000011', '00000000-0000-0000-0002-000000000002'),
  ('00000000-0000-0000-0005-000000000012', '00000000-0000-0000-0002-000000000003'),
  ('00000000-0000-0000-0005-000000000013', '00000000-0000-0000-0002-000000000004'),
  ('00000000-0000-0000-0005-000000000014', '00000000-0000-0000-0002-000000000004'),
  ('00000000-0000-0000-0005-000000000015', '00000000-0000-0000-0002-000000000004')
on conflict do nothing;

-- =============================================================================
-- 6. BANNERS (no unique key — guard with WHERE NOT EXISTS)
-- =============================================================================
insert into public.banners (image, title, subtitle, link, is_active, sort_order)
select v.image, v.title, v.subtitle, v.link, true, v.sort_order
from (values
  ('https://picsum.photos/seed/banner1/1200/400', 'Summer Sale',  'Up to 50% off on all electronics',   '/products?category=electronics', 1),
  ('https://picsum.photos/seed/banner2/1200/400', 'New Arrivals', 'Check out the latest fashion trends', '/products?category=clothing',    2),
  ('https://picsum.photos/seed/banner3/1200/400', 'Sports Week',  'Gear up for your best performance',   '/products?category=sports',      3)
) as v(image, title, subtitle, link, sort_order)
where not exists (select 1 from public.banners b where b.title = v.title);

-- =============================================================================
-- 7. ADS BANNERS
-- =============================================================================
insert into public.ads_banners (image, title, link, position, is_active, sort_order)
select v.image, v.title, v.link, v.position, true, v.sort_order
from (values
  ('https://picsum.photos/seed/ad1/400/300', 'Flash Deal – Phones',  '/products?category=smartphones', 'sidebar',  1),
  ('https://picsum.photos/seed/ad2/400/300', 'Nike Shoes – 20% off', '/products?category=footwear',    'homepage', 2)
) as v(image, title, link, position, sort_order)
where not exists (select 1 from public.ads_banners a where a.title = v.title);

-- =============================================================================
-- 8. WEBSITE CONFIG (single row — only if table is empty)
-- =============================================================================
insert into public.website_config (store_name, tagline, business_info, meta)
select
  'Mamta E-Store',
  'Your one-stop online shopping destination',
  '{"email":"support@mamtastore.com","phone":"+1-800-MAMTA","address":"123 Commerce St, City, Country"}'::jsonb,
  '{"title":"Mamta E-Store – Shop Online","description":"Buy electronics, clothing, home goods and more at the best prices."}'::jsonb
where not exists (select 1 from public.website_config);

-- =============================================================================
-- 9. SOCIAL MEDIA (skip platform if already present)
-- =============================================================================
insert into public.social_media (platform, url, is_active)
select v.platform, v.url, true
from (values
  ('facebook',  'https://facebook.com/mamtastore'),
  ('instagram', 'https://instagram.com/mamtastore'),
  ('twitter',   'https://twitter.com/mamtastore'),
  ('youtube',   'https://youtube.com/@mamtastore')
) as v(platform, url)
where not exists (select 1 from public.social_media s where s.platform = v.platform);

commit;
