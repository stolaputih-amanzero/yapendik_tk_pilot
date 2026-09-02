-- ==============================================================================
-- Migration: Make student-photos bucket public and configure access policies
-- Version: 20260902070000
-- ==============================================================================

-- 1. Ensure student-photos bucket is PUBLIC so browser <img> tags can render photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'student-photos',
  'student-photos',
  TRUE,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = TRUE,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- 2. Storage Policies (Idempotent block)
DO $$
BEGIN
  DROP POLICY IF EXISTS "Public can read student photos" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can read student photos" ON storage.objects;
  DROP POLICY IF EXISTS "Teachers can upload student photos" ON storage.objects;
  DROP POLICY IF EXISTS "Teachers can update student photos" ON storage.objects;
  DROP POLICY IF EXISTS "Teachers can delete student photos" ON storage.objects;
  DROP POLICY IF EXISTS "Allow student photo upload" ON storage.objects;
  DROP POLICY IF EXISTS "Allow student photo read" ON storage.objects;
  DROP POLICY IF EXISTS "Allow student photo update" ON storage.objects;
  DROP POLICY IF EXISTS "Allow student photo delete" ON storage.objects;
END $$;

-- Policy 1: Public SELECT (allows web browser <img> to load public student photos)
CREATE POLICY "Allow student photo read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'student-photos');

-- Policy 2: Allow INSERT for authenticated users & anon
CREATE POLICY "Allow student photo upload"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'student-photos');

-- Policy 3: Allow UPDATE for public
CREATE POLICY "Allow student photo update"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'student-photos');

-- Policy 4: Allow DELETE for public
CREATE POLICY "Allow student photo delete"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'student-photos');
