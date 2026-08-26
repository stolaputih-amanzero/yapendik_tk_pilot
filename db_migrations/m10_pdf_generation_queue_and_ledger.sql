-- ==============================================================================
-- YAPENDIK SCHOOL OS TK PILOT - MIGRATION M10
-- STAGE 5 / ADR-04: SERVER-SIDE PDF GENERATION QUEUE & ARTIFACT LEDGER
-- ==============================================================================
-- 1. Create PDF Generation Requests Table (Ledger & Queue)
-- 2. State Machine Immutability Guard Trigger
-- 3. Fail-Closed RLS Matrix (Headmaster & Superadmin Only)
-- ==============================================================================

BEGIN;

-- ==============================================================================
-- 1. TABLE DEFINITION: pdf_generation_requests
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.pdf_generation_requests (
  request_id TEXT PRIMARY KEY,
  report_type TEXT NOT NULL CHECK (report_type IN ('LPPA_SEMESTER_REPORT', 'CONTINUITY_PROFILE', 'SAFETY_INCIDENT')),
  entity_id TEXT NOT NULL,
  school_id TEXT NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  requested_by_person_id TEXT NOT NULL REFERENCES public.persons(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')),
  storage_object_path TEXT,
  sha256_checksum TEXT,
  bsre_signature_status TEXT NOT NULL DEFAULT 'UNSIGNED' CHECK (bsre_signature_status IN ('UNSIGNED', 'PENDING_BSRE', 'SIGNED', 'FAILED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  completed_at TIMESTAMPTZ,
  error_message TEXT
);

-- Indices for queue polling and audit lookup
CREATE INDEX IF NOT EXISTS idx_pdf_req_school_status ON public.pdf_generation_requests (school_id, status);
CREATE INDEX IF NOT EXISTS idx_pdf_req_entity_id ON public.pdf_generation_requests (entity_id);
CREATE INDEX IF NOT EXISTS idx_pdf_req_created_at ON public.pdf_generation_requests (created_at DESC);

-- ==============================================================================
-- 2. STATE MACHINE & IMMUTABILITY GUARD
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.fn_guard_pdf_request_lifecycle()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent modification of terminal COMPLETED artifact
  IF OLD.status = 'COMPLETED' AND NEW.status <> 'COMPLETED' THEN
    RAISE EXCEPTION 'INVALID_STATE_TRANSITION: Completed PDF artifact % is immutable and cannot be transitioned to %.',
      OLD.request_id, NEW.status;
  END IF;

  -- Prevent tampering with checksum of completed artifact
  IF OLD.status = 'COMPLETED' AND OLD.sha256_checksum IS NOT NULL AND NEW.sha256_checksum <> OLD.sha256_checksum THEN
    RAISE EXCEPTION 'ARTIFACT_TAMPERED_OR_CORRUPTED: SHA-256 checksum of completed PDF % cannot be mutated.',
      OLD.request_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_guard_pdf_request_lifecycle ON public.pdf_generation_requests;
CREATE TRIGGER trg_guard_pdf_request_lifecycle
  BEFORE UPDATE ON public.pdf_generation_requests
  FOR EACH ROW EXECUTE FUNCTION public.fn_guard_pdf_request_lifecycle();

-- ==============================================================================
-- 3. FAIL-CLOSED RLS MATRIX
-- ==============================================================================

ALTER TABLE public.pdf_generation_requests ENABLE ROW LEVEL SECURITY;

-- 3.1 SELECT Policy: Headmaster of school or Foundation Governance
DROP POLICY IF EXISTS "Headmaster and Governance can view PDF queue" ON public.pdf_generation_requests;
CREATE POLICY "Headmaster and Governance can view PDF queue"
  ON public.pdf_generation_requests FOR SELECT TO authenticated
  USING (
    public.auth_is_headmaster_of(school_id)
    OR public.auth_is_governance()
  );

-- 3.2 INSERT Policy: Headmaster of school or Foundation Governance
DROP POLICY IF EXISTS "Headmaster and Governance can enqueue PDF request" ON public.pdf_generation_requests;
CREATE POLICY "Headmaster and Governance can enqueue PDF request"
  ON public.pdf_generation_requests FOR INSERT TO authenticated
  WITH CHECK (
    (public.auth_is_headmaster_of(school_id) AND requested_by_person_id = public.get_auth_person_id())
    OR public.auth_is_governance()
  );

-- 3.3 UPDATE Policy: Headmaster, Worker, or Governance
DROP POLICY IF EXISTS "Headmaster and Governance can update PDF request" ON public.pdf_generation_requests;
CREATE POLICY "Headmaster and Governance can update PDF request"
  ON public.pdf_generation_requests FOR UPDATE TO authenticated
  USING (
    public.auth_is_headmaster_of(school_id)
    OR public.auth_is_governance()
  ) WITH CHECK (
    public.auth_is_headmaster_of(school_id)
    OR public.auth_is_governance()
  );

COMMIT;
