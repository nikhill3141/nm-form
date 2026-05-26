CREATE TYPE "public"."form_theme" AS ENUM('forest_cinematic', 'ocean_flow', 'cosmic_dark', 'minimal_luxury', 'cyber_neon', 'sunset_studio');--> statement-breakpoint
ALTER TABLE "form_links" DROP CONSTRAINT "form_links_token_unique";--> statement-breakpoint
DROP INDEX "form_links_token_idx";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "refresh_token" SET DATA TYPE varchar(500);--> statement-breakpoint
ALTER TABLE "forms" ALTER COLUMN "theme" SET DEFAULT 'forest_cinematic'::"public"."form_theme";--> statement-breakpoint
ALTER TABLE "forms" ALTER COLUMN "theme" SET DATA TYPE "public"."form_theme" USING (
  CASE
    WHEN "theme" IN ('forest_cinematic', 'Forest Cinematic', 'Forest', 'default') THEN 'forest_cinematic'
    WHEN "theme" IN ('ocean_flow', 'Ocean Flow', 'Ocean') THEN 'ocean_flow'
    WHEN "theme" IN ('cosmic_dark', 'Cosmic Dark', 'Cosmic') THEN 'cosmic_dark'
    WHEN "theme" IN ('minimal_luxury', 'Minimal Luxury', 'Luxury') THEN 'minimal_luxury'
    WHEN "theme" IN ('cyber_neon', 'Cyber Neon') THEN 'cyber_neon'
    WHEN "theme" IN ('sunset_studio', 'Sunset Studio') THEN 'sunset_studio'
    ELSE 'forest_cinematic'
  END
)::"public"."form_theme";--> statement-breakpoint
ALTER TABLE "forms" ALTER COLUMN "theme" SET NOT NULL;--> statement-breakpoint
DELETE FROM "form_links"
WHERE "id" IN (
  SELECT "id"
  FROM (
    SELECT "id", ROW_NUMBER() OVER (PARTITION BY "form_id" ORDER BY "created_at" ASC) AS "row_number"
    FROM "form_links"
  ) duplicates
  WHERE duplicates."row_number" > 1
);--> statement-breakpoint
CREATE UNIQUE INDEX "form_links_form_idx" ON "form_links" USING btree ("form_id");--> statement-breakpoint
ALTER TABLE "form_links" DROP COLUMN "token";
