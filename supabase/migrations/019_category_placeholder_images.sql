-- Adds placeholder product-category images (via LoremFlickr, free & keyless)
-- for the root categories that currently have no image set.
-- Replace these URLs with real product photography whenever you have it —
-- just re-run an `update` with the real image URL for that category id.

update public.categories set image = 'https://loremflickr.com/600/600/smartphone', icon_image = 'https://loremflickr.com/80/80/smartphone' where id = '340187a6-b311-4c8a-bd54-0d9433d59c45'; -- Mobiles
update public.categories set image = 'https://loremflickr.com/600/600/television', icon_image = 'https://loremflickr.com/80/80/television' where id = 'b58aa690-725e-4b94-be39-81817ab57076'; -- Televisions
update public.categories set image = 'https://loremflickr.com/600/600/laptop', icon_image = 'https://loremflickr.com/80/80/laptop' where id = 'c0ed4f48-e681-4bea-ba93-dce11471471e'; -- Laptops
update public.categories set image = 'https://loremflickr.com/600/600/air-conditioner', icon_image = 'https://loremflickr.com/80/80/air-conditioner' where id = '6ef72a84-6ed2-4a48-8c45-49db0885d73d'; -- Air Conditioners
update public.categories set image = 'https://loremflickr.com/600/600/air-cooler', icon_image = 'https://loremflickr.com/80/80/air-cooler' where id = '45295930-f5f3-4663-9d55-0094ce5b9e14'; -- Coolers
update public.categories set image = 'https://loremflickr.com/600/600/ceiling-fan', icon_image = 'https://loremflickr.com/80/80/ceiling-fan' where id = '3dcb41ac-449f-4b72-8c8e-fcd5695bc39b'; -- Fans
update public.categories set image = 'https://loremflickr.com/600/600/refrigerator', icon_image = 'https://loremflickr.com/80/80/refrigerator' where id = 'bdcef4c3-3a9d-4950-9f7b-43a2cfb1e5e3'; -- Refrigerators
update public.categories set image = 'https://loremflickr.com/600/600/headphones', icon_image = 'https://loremflickr.com/80/80/headphones' where id = '4518a992-ab52-4989-9073-168f62b87fb1'; -- Headphones & Earphones
update public.categories set image = 'https://loremflickr.com/600/600/kitchen-appliance', icon_image = 'https://loremflickr.com/80/80/kitchen-appliance' where id = 'cb1f8d43-6b89-41b8-b34a-b84f73ca253b'; -- Kitchen Appliances
update public.categories set image = 'https://loremflickr.com/600/600/grooming-kit', icon_image = 'https://loremflickr.com/80/80/grooming-kit' where id = 'd7635155-ac84-43f3-bcc5-4882843f2377'; -- Grooming
update public.categories set image = 'https://loremflickr.com/600/600/gadgets', icon_image = 'https://loremflickr.com/80/80/gadgets' where id = '7ac519e2-cdf5-4cc3-a449-b8857d33fcaa'; -- Accessories
update public.categories set image = 'https://loremflickr.com/600/600/tablet-device', icon_image = 'https://loremflickr.com/80/80/tablet-device' where id = '7c2b1998-6567-4d5e-8c40-e71177f800f2'; -- Tablets
update public.categories set image = 'https://loremflickr.com/600/600/washing-machine', icon_image = 'https://loremflickr.com/80/80/washing-machine' where id = '7c088428-2790-4276-9ca0-b0410f1e8e7a'; -- Washing Machines
update public.categories set image = 'https://loremflickr.com/600/600/soundbar', icon_image = 'https://loremflickr.com/80/80/soundbar' where id = 'a7a3ca30-a329-48e3-8547-1ea00ad4c948'; -- Home Theaters & Soundbars
update public.categories set image = 'https://loremflickr.com/600/600/microwave-oven', icon_image = 'https://loremflickr.com/80/80/microwave-oven' where id = 'd237fab3-7939-4c93-920e-f599c04e7bfa'; -- Microwaves
update public.categories set image = 'https://loremflickr.com/600/600/speaker', icon_image = 'https://loremflickr.com/80/80/speaker' where id = '7b1489a1-1579-43cb-ab4b-9375572d695f'; -- Speakers & Media Players
update public.categories set image = 'https://loremflickr.com/600/600/vacuum-cleaner', icon_image = 'https://loremflickr.com/80/80/vacuum-cleaner' where id = '8c2e0dfd-14b1-4981-a386-930ffb5f7fd9'; -- Vacuum Cleaners
update public.categories set image = 'https://loremflickr.com/600/600/smartwatch', icon_image = 'https://loremflickr.com/80/80/smartwatch' where id = 'c6482222-be36-4d90-92ed-de0a7e26ab65'; -- Wearables
update public.categories set image = 'https://loremflickr.com/600/600/dishwasher', icon_image = 'https://loremflickr.com/80/80/dishwasher' where id = 'd40de631-04a5-4ebc-b513-23622db9a0e8'; -- Dishwashers
