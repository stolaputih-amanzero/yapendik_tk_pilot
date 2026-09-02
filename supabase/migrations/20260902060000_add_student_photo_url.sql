-- ==============================================================================
-- Migration: Add photo_url to students & Ensure avatar_url on persons
-- Version: 20260902060000
-- ==============================================================================

-- 1. Ensure photo_url column on students table
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS photo_url text NULL;

-- 2. Ensure avatar_url column on persons table
ALTER TABLE public.persons ADD COLUMN IF NOT EXISTS avatar_url text NULL;

-- 3. Sync existing avatar_url from persons to students if any
UPDATE public.students s
SET photo_url = p.avatar_url
FROM public.persons p
WHERE s.person_id = p.id AND p.avatar_url IS NOT NULL AND s.photo_url IS NULL;
