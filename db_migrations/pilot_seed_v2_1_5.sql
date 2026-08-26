BEGIN;

-- ==============================================================================
-- YAPENDIK SCHOOL OS TK PILOT - V2.1.5 SEED / BOOTSTRAP
-- ==============================================================================
-- Script ini terpisah dari file migrasi RLS utama (V2.1.5 Hardened).
-- Hanya dieksekusi di environment Pilot/Development.
-- ==============================================================================

INSERT INTO governance_profiles (id, person_id, role, is_active)
VALUES ('gov_prof_andreas_01', 'per_yayasan_andreas', 'SUPERADMIN', true)
ON CONFLICT (id) DO NOTHING;

COMMIT;
