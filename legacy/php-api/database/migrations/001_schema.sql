-- Srisun — Clients & Case Studies schema
-- MySQL 8.0+ / MariaDB 10.4+. Run against a NEW database; never against an
-- existing WordPress database.
--
--   mysql -u <user> -p <database> < database/migrations/001_schema.sql

SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- ---------------------------------------------------------------- accounts
CREATE TABLE IF NOT EXISTS admin_users (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email         VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name          VARCHAR(120) NOT NULL,
  role          ENUM('admin','editor') NOT NULL DEFAULT 'editor',
  is_active     TINYINT(1) NOT NULL DEFAULT 1,
  last_login_at DATETIME NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------- media
-- Files live outside the web root; only the generated filename is stored.
CREATE TABLE IF NOT EXISTS media (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  filename      VARCHAR(190) NOT NULL UNIQUE,
  original_name VARCHAR(255) NOT NULL,
  mime_type     VARCHAR(100) NOT NULL,
  size_bytes    INT UNSIGNED NOT NULL,
  kind          ENUM('image','pdf') NOT NULL,
  uploaded_by   INT UNSIGNED NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_media_user FOREIGN KEY (uploaded_by) REFERENCES admin_users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------- taxonomies
CREATE TABLE IF NOT EXISTS industries (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug       VARCHAR(120) NOT NULL UNIQUE,
  name       VARCHAR(120) NOT NULL,
  sort_order SMALLINT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS solutions (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug       VARCHAR(120) NOT NULL UNIQUE,
  name       VARCHAR(120) NOT NULL,
  sort_order SMALLINT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS service_tags (
  id   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(120) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------- clients
CREATE TABLE IF NOT EXISTS clients (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug           VARCHAR(190) NOT NULL UNIQUE,
  name           VARCHAR(190) NOT NULL,
  website_url    VARCHAR(255) NULL,
  description    TEXT NULL,
  logo_media_id  INT UNSIGNED NULL,
  logo_path      VARCHAR(255) NULL,   -- existing static asset, e.g. /assets/clients/x.png
  sort_order     SMALLINT NOT NULL DEFAULT 0,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_clients_logo FOREIGN KEY (logo_media_id) REFERENCES media(id) ON DELETE SET NULL,
  INDEX idx_clients_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS client_industries (
  client_id   INT UNSIGNED NOT NULL,
  industry_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (client_id, industry_id),
  CONSTRAINT fk_ci_client   FOREIGN KEY (client_id)   REFERENCES clients(id)    ON DELETE CASCADE,
  CONSTRAINT fk_ci_industry FOREIGN KEY (industry_id) REFERENCES industries(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS client_solutions (
  client_id   INT UNSIGNED NOT NULL,
  solution_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (client_id, solution_id),
  CONSTRAINT fk_cs_client   FOREIGN KEY (client_id)   REFERENCES clients(id)   ON DELETE CASCADE,
  CONSTRAINT fk_cs_solution FOREIGN KEY (solution_id) REFERENCES solutions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS client_tags (
  client_id INT UNSIGNED NOT NULL,
  tag_id    INT UNSIGNED NOT NULL,
  PRIMARY KEY (client_id, tag_id),
  CONSTRAINT fk_ct_client FOREIGN KEY (client_id) REFERENCES clients(id)      ON DELETE CASCADE,
  CONSTRAINT fk_ct_tag    FOREIGN KEY (tag_id)    REFERENCES service_tags(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------ case studies
-- Every narrative column is nullable on purpose: a field stays empty until an
-- admin enters verified content, and empty fields are not rendered.
CREATE TABLE IF NOT EXISTS case_studies (
  id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  client_id         INT UNSIGNED NOT NULL UNIQUE,
  title             VARCHAR(190) NULL,
  summary           TEXT NULL,
  executive_summary TEXT NULL,
  about_client      TEXT NULL,
  challenge         TEXT NULL,
  solution          TEXT NULL,
  services          JSON NULL,
  technologies      JSON NULL,
  metrics           JSON NULL,
  results           TEXT NULL,
  testimonial_quote  TEXT NULL,
  testimonial_author VARCHAR(190) NULL,
  testimonial_role   VARCHAR(190) NULL,
  conclusion        TEXT NULL,
  hero_media_id     INT UNSIGNED NULL,
  pdf_media_id      INT UNSIGNED NULL,
  status            ENUM('draft','published') NOT NULL DEFAULT 'draft',
  published_at      DATETIME NULL,
  updated_by        INT UNSIGNED NULL,
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_case_client FOREIGN KEY (client_id)     REFERENCES clients(id)     ON DELETE CASCADE,
  CONSTRAINT fk_case_hero   FOREIGN KEY (hero_media_id) REFERENCES media(id)       ON DELETE SET NULL,
  CONSTRAINT fk_case_pdf    FOREIGN KEY (pdf_media_id)  REFERENCES media(id)       ON DELETE SET NULL,
  CONSTRAINT fk_case_user   FOREIGN KEY (updated_by)    REFERENCES admin_users(id) ON DELETE SET NULL,
  INDEX idx_case_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS case_study_timeline (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  case_study_id INT UNSIGNED NOT NULL,
  stage         VARCHAR(120) NOT NULL,
  title         VARCHAR(190) NULL,
  detail        TEXT NULL,
  sort_order    SMALLINT NOT NULL DEFAULT 0,
  CONSTRAINT fk_timeline_case FOREIGN KEY (case_study_id) REFERENCES case_studies(id) ON DELETE CASCADE,
  INDEX idx_timeline_case (case_study_id, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS case_study_images (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  case_study_id INT UNSIGNED NOT NULL,
  media_id      INT UNSIGNED NOT NULL,
  alt_text      VARCHAR(255) NULL,
  sort_order    SMALLINT NOT NULL DEFAULT 0,
  CONSTRAINT fk_csimg_case  FOREIGN KEY (case_study_id) REFERENCES case_studies(id) ON DELETE CASCADE,
  CONSTRAINT fk_csimg_media FOREIGN KEY (media_id)      REFERENCES media(id)        ON DELETE CASCADE,
  INDEX idx_csimg_case (case_study_id, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------- sessions
CREATE TABLE IF NOT EXISTS admin_sessions (
  id         CHAR(64) PRIMARY KEY,
  user_id    INT UNSIGNED NOT NULL,
  csrf_token CHAR(64) NOT NULL,
  ip         VARCHAR(45) NULL,
  user_agent VARCHAR(255) NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_session_user FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE CASCADE,
  INDEX idx_session_expiry (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
