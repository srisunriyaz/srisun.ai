-- Browsers registered by admins for Firebase Cloud Messaging (FCM) push alerts.
CREATE TABLE IF NOT EXISTS push_devices (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  token         TEXT NOT NULL UNIQUE,               -- FCM registration token
  label         TEXT,                               -- e.g. "Chrome on Android"
  origin        TEXT NOT NULL,                      -- site the admin used; click-through goes back here
  enabled       BOOLEAN NOT NULL DEFAULT TRUE,
  last_error    TEXT,
  last_sent_at  TIMESTAMPTZ,
  last_seen_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS push_devices_user ON push_devices (user_id);
