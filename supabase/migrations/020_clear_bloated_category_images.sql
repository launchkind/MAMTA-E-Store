-- The old admin image-uploader had a bug where it stored uploaded photos as
-- raw base64 text directly in the categories table instead of uploading
-- them to Supabase Storage. Some rows ended up with 1-4MB of base64 in a
-- single column, which made every homepage query fetching categories slow
-- enough to effectively break the "Featured Categories" circles and the
-- category sidebar (both went from returning fast to timing out / failing).
--
-- The uploader is now fixed (apps/admin/src/components/ui/image-upload.tsx
-- uploads to Supabase Storage and stores a short URL), so this just clears
-- the old bloated values. Re-upload each category's image from Admin →
-- Categories → Edit once this runs.

update public.categories
set image = null
where image is not null and length(image) > 5000;

update public.categories
set icon_image = null
where icon_image is not null and length(icon_image) > 5000;
