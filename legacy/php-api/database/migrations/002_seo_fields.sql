-- SEO fields for case studies. Run once (MySQL has no ADD COLUMN IF NOT EXISTS).
ALTER TABLE case_studies
  ADD COLUMN seo_title        VARCHAR(190) NULL AFTER title,
  ADD COLUMN meta_description VARCHAR(320) NULL AFTER seo_title,
  ADD COLUMN keywords         VARCHAR(500) NULL AFTER meta_description,
  ADD COLUMN og_title         VARCHAR(190) NULL AFTER keywords,
  ADD COLUMN og_description   VARCHAR(320) NULL AFTER og_title;
