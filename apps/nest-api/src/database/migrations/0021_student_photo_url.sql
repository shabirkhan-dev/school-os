ALTER TABLE "students" ADD COLUMN IF NOT EXISTS "photo_url" text;

UPDATE "navigation_items"
SET "href" = '/admin/admissions', "updated_at" = NOW()
WHERE "key" = 'admissions' AND ("href" IS NULL OR "href" = '');
