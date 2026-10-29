-- Editable site pages (the legal/policy pages). The page list is fixed by the
-- site navigation; the admin edits the text and publishes it.
CREATE TABLE IF NOT EXISTS site_pages (
  slug        TEXT PRIMARY KEY,                 -- e.g. privacy-policy
  path        TEXT NOT NULL UNIQUE,             -- e.g. /legal/privacy-policy
  title       TEXT NOT NULL,
  summary     TEXT NOT NULL DEFAULT '',
  body        TEXT NOT NULL DEFAULT '',         -- plain text: "## " headings, "- " bullets, blank line = new paragraph
  status      TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  sort_order  INT NOT NULL DEFAULT 0,
  updated_by  INT REFERENCES admin_users(id) ON DELETE SET NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO site_pages (slug, path, title, sort_order)
SELECT lower(regexp_replace(t.title, '[^A-Za-z0-9]+', '-', 'g')),
       '/legal/' || lower(regexp_replace(t.title, '[^A-Za-z0-9]+', '-', 'g')),
       t.title,
       t.n
  FROM unnest(ARRAY['Security', 'Compliance', 'IPR Complaints', 'Terms of Service', 'Privacy Policy', 'Refund Policy',
                    'Trademark Policy', 'Cookie Policy', 'GDPR Compliance', 'Abuse Policy']) WITH ORDINALITY AS t(title, n)
ON CONFLICT (slug) DO NOTHING;
