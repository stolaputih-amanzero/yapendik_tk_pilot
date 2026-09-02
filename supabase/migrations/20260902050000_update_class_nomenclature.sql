-- ═══════════════════════════════════════════════════════════════════
-- MIGRATION: 20260902050000_update_class_nomenclature.sql
-- Description: Standardize Kindergarten Class Nomenclature (Hukum 12)
-- Compliance: Stage 4.5 FB-01 (Private Storage + Storage Policies)
-- ═══════════════════════════════════════════════════════════════════

-- 1. Perbarui nama kelas yang masih menggunakan format lama 'Kelompok'
UPDATE public.classes 
SET name = 'Kelas TK A' 
WHERE name ILIKE '%Kelompok A%' OR name = 'TK A' OR id = 'cls_maranatha_tka';

UPDATE public.classes 
SET name = 'Kelas TK B' 
WHERE name ILIKE '%Kelompok B%' OR name = 'TK B' OR id = 'cls_maranatha_tkb';

-- 2. Idempotent Upsert untuk menjamin nama kanonikal di tabel classes
INSERT INTO public.classes (id, school_id, academic_year_id, name, age_group, room_number, capacity, is_active)
VALUES 
  ('cls_maranatha_tka', 'sch_tk_maranatha', 'ay_maranatha_2026_2027_ganjil', 'Kelas TK A', 'TK_A_4_5', 'Ruang TK A', 20, TRUE),
  ('cls_maranatha_tkb', 'sch_tk_maranatha', 'ay_maranatha_2026_2027_ganjil', 'Kelas TK B', 'TK_B_5_6', 'Ruang TK B', 20, TRUE)
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  room_number = EXCLUDED.room_number,
  age_group = EXCLUDED.age_group,
  is_active = EXCLUDED.is_active;

-- 3. Storage Bucket untuk student-photos (Private Bucket — FB-01 Compliance)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'student-photos',
  'student-photos',
  FALSE,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = FALSE,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- 4. Storage Policies untuk student-photos bucket (Idempotent block)
DO $$
BEGIN
  DROP POLICY IF EXISTS "Teachers can upload student photos" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can read student photos" ON storage.objects;
  DROP POLICY IF EXISTS "Teachers can update student photos" ON storage.objects;
  DROP POLICY IF EXISTS "Teachers can delete student photos" ON storage.objects;
END $$;

-- Policy 1: Pengguna terautentikasi (Guru/Staf) dapat upload foto
CREATE POLICY "Teachers can upload student photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'student-photos');

-- Policy 2: Pengguna terautentikasi dapat melihat foto
CREATE POLICY "Authenticated users can read student photos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'student-photos');

-- Policy 3: Pengguna terautentikasi dapat memperbarui foto
CREATE POLICY "Teachers can update student photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'student-photos');

-- Policy 4: Pengguna terautentikasi dapat menghapus foto
CREATE POLICY "Teachers can delete student photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'student-photos');
