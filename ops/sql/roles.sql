-- Database roles for the UFC website. Run this ONCE, as the database OWNER (the login you run migrations with), in the Neon SQL editor.
--
-- Why: today the site connects with the owner login, so any bug, leaked secret or wrong command can DROP or TRUNCATE every table.
-- After this the site uses `ufc_app`, which can read and write rows but cannot change or destroy the structure, and the backup job uses
-- `ufc_backup`, which can only read. The owner login is then used for migrations only and never leaves your machine or the build.
--
-- Before running: replace both passwords below (any long random string: `openssl rand -base64 24`) and keep them in your password manager.
-- It is safe to run again; it only adds permissions.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'ufc_app') THEN
    CREATE ROLE ufc_app LOGIN PASSWORD 'REPLACE_ME_APP_PASSWORD';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'ufc_backup') THEN
    CREATE ROLE ufc_backup LOGIN PASSWORD 'REPLACE_ME_BACKUP_PASSWORD';
  END IF;
END
$$;

DO $$
BEGIN
  EXECUTE format('GRANT CONNECT ON DATABASE %I TO ufc_app, ufc_backup', current_database());
END
$$;

GRANT USAGE ON SCHEMA public TO ufc_app, ufc_backup;

-- The site: rows only. No TRUNCATE, no DROP, no ALTER, no CREATE.
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO ufc_app;
GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO ufc_app;

-- Tables a later migration creates (run by the owner) get the same permissions automatically.
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO ufc_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO ufc_app;

-- The backup job: read everything, change nothing.
GRANT SELECT ON ALL TABLES IN SCHEMA public TO ufc_backup;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO ufc_backup;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO ufc_backup;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON SEQUENCES TO ufc_backup;

-- Nobody but the owner makes new objects in the public schema.
REVOKE CREATE ON SCHEMA public FROM PUBLIC;

-- A runaway query or a forgotten open transaction cannot hold the database hostage.
ALTER ROLE ufc_app SET statement_timeout = '30s';
ALTER ROLE ufc_app SET idle_in_transaction_session_timeout = '30s';
ALTER ROLE ufc_backup SET statement_timeout = '10min';

-- Check it worked (run these as ufc_app afterwards; each of the last two should say "permission denied"):
--   SELECT count(*) FROM users;
--   TRUNCATE users;
--   DROP TABLE users;
