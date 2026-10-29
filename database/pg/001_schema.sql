-- Srisun website schema (PostgreSQL / Neon). Safe to re-run: every statement
-- is IF NOT EXISTS. Applied by `node scripts/db-migrate.mjs`.

CREATE TABLE IF NOT EXISTS admin_users (
  id             SERIAL PRIMARY KEY,
  email          TEXT NOT NULL UNIQUE,              -- stored lower-case
  name           TEXT NOT NULL,
  password_hash  TEXT NOT NULL,
  role           TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'editor')),
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at  TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- id is sha256(cookie value); the raw token only ever lives in the cookie
CREATE TABLE IF NOT EXISTS admin_sessions (
  id          TEXT PRIMARY KEY,
  user_id     INT NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  csrf_token  TEXT NOT NULL,
  ip_hash     TEXT,
  user_agent  TEXT,
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS admin_sessions_expiry ON admin_sessions (expires_at);

-- Uploaded files are kept in the database: public images and case-study PDFs
-- are served by /api/v1/media/:id, resumes only by authenticated admin routes.
CREATE TABLE IF NOT EXISTS files (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind           TEXT NOT NULL CHECK (kind IN ('image', 'pdf', 'resume')),
  is_public      BOOLEAN NOT NULL DEFAULT FALSE,
  original_name  TEXT NOT NULL,
  mime_type      TEXT NOT NULL,
  size_bytes     INT NOT NULL,
  data           BYTEA NOT NULL,
  uploaded_by    INT REFERENCES admin_users(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS taxonomies (
  kind        TEXT NOT NULL CHECK (kind IN ('industry', 'solution')),
  name        TEXT NOT NULL,
  sort_order  INT NOT NULL DEFAULT 0,
  PRIMARY KEY (kind, name)
);

CREATE TABLE IF NOT EXISTS clients (
  id            SERIAL PRIMARY KEY,
  slug          TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  website_url   TEXT,
  description   TEXT,
  logo_path     TEXT,                                -- static logo under /assets
  logo_file_id  UUID REFERENCES files(id) ON DELETE SET NULL,
  industries    TEXT[] NOT NULL DEFAULT '{}',
  solutions     TEXT[] NOT NULL DEFAULT '{}',
  tags          TEXT[] NOT NULL DEFAULT '{}',
  sort_order    INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS case_studies (
  client_id          INT PRIMARY KEY REFERENCES clients(id) ON DELETE CASCADE,
  status             TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at       TIMESTAMPTZ,
  title              TEXT,
  seo_title          TEXT,
  meta_description   TEXT,
  keywords           TEXT,
  og_title           TEXT,
  og_description     TEXT,
  summary            TEXT,
  executive_summary  TEXT,
  about_client       TEXT,
  challenge          TEXT,
  solution           TEXT,
  services           JSONB NOT NULL DEFAULT '[]',
  technologies       JSONB NOT NULL DEFAULT '[]',
  metrics            JSONB NOT NULL DEFAULT '[]',
  timeline           JSONB NOT NULL DEFAULT '[]',
  images             JSONB NOT NULL DEFAULT '[]',     -- [{ fileId, alt }]
  results            TEXT,
  conclusion         TEXT,
  testimonial        JSONB,                           -- { quote, author, role }
  hero_file_id       UUID REFERENCES files(id) ON DELETE SET NULL,
  pdf_file_id        UUID REFERENCES files(id) ON DELETE SET NULL,
  updated_by         INT REFERENCES admin_users(id) ON DELETE SET NULL,
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS jobs (
  id                SERIAL PRIMARY KEY,
  slug              TEXT NOT NULL UNIQUE,
  title             TEXT NOT NULL,
  department        TEXT NOT NULL DEFAULT '',
  location          TEXT NOT NULL DEFAULT '',
  employment_type   TEXT NOT NULL DEFAULT '',
  summary           TEXT NOT NULL DEFAULT '',
  responsibilities  JSONB NOT NULL DEFAULT '[]',
  qualifications    JSONB NOT NULL DEFAULT '[]',
  status            TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'closed')),
  sort_order        INT NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS job_applications (
  id                  SERIAL PRIMARY KEY,
  job_id              INT REFERENCES jobs(id) ON DELETE SET NULL,
  job_title           TEXT NOT NULL,                  -- kept if the job is deleted
  first_name          TEXT NOT NULL,
  last_name           TEXT NOT NULL,
  email               TEXT NOT NULL,
  phone               TEXT NOT NULL,
  current_location    TEXT NOT NULL,
  preferred_location  TEXT,
  experience          TEXT,
  employer            TEXT,
  notice_period       TEXT,
  skills              TEXT NOT NULL,
  portfolio_url       TEXT,
  resume_file_id      UUID REFERENCES files(id) ON DELETE SET NULL,
  status              TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewing', 'shortlisted', 'rejected', 'hired')),
  notes               TEXT,
  ip_hash             TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS job_applications_created ON job_applications (created_at DESC);

CREATE TABLE IF NOT EXISTS enquiries (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  phone       TEXT,
  company     TEXT,
  topic       TEXT,
  message     TEXT NOT NULL,
  page        TEXT,
  status      TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'closed')),
  notes       TEXT,
  ip_hash     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS enquiries_created ON enquiries (created_at DESC);

-- fixed-window counters for login attempts and public form submissions
CREATE TABLE IF NOT EXISTS rate_limits (
  key     TEXT NOT NULL,
  bucket  TIMESTAMPTZ NOT NULL,
  hits    INT NOT NULL DEFAULT 0,
  PRIMARY KEY (key, bucket)
);
