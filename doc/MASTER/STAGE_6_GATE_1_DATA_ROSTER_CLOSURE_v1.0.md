# STAGE 6 GATE 1: DATA ROSTER & STUDENT IDENTITY ARCHITECTURE CLOSURE
**Document ID:** `DOC-STAGE-6-GATE-1-DATA-ROSTER-CLOSURE-v1.0`  
**Status:** 🟢 **CERTIFIED & LOCKED**  
**Timestamp:** `2026-09-02T13:25:00+07:00`  
**Design System:** Amanaura Design System v3.0  
**Scope:** Data Roster, Student Photo Storage Engine, Parent/Guardian Relations, and Cross-Class Authorization Invariants  

---

## 🏛️ 1. Executive Summary & Production State

Modul **Data Roster** telah selesai diimplementasikan, diverifikasi melalui *browser live end-to-end testing*, dan disertifikasi mematuhi seluruh konstitusi desain dan keamanan Yapendik School OS:

1. **Struktur & Navigasi Roster ([DataRosterWorkspace.tsx](file:///d:/PROJECT/yapendik-tk-pilot/src/pages/roster/DataRosterWorkspace.tsx))**:
   - Tab Kelas 2-baris yang kompak (`Kelas TK A (4-5 Thn)` dan `Kelas TK B (5-6 Thn)`).
   - Baris konteks guru hanya menampilkan ikon dan nama representatif: Wali Kelas (`UserCheck`) dan Guru Pendamping (`Users`).
   - Pencarian instan multi-parameter (Nama Lengkap, Nama Panggilan, NIS) dan Filter Jenis Kelamin (Semua, Laki-laki, Perempuan).

2. **Kartu Siswa & Privasi Bertingkat ([StudentListItem.tsx](file:///d:/PROJECT/yapendik-tk-pilot/src/components/roster/StudentListItem.tsx))**:
   - **Avatar Inisial Bersih (Signature #5 Refined)**: 1 palet warna tenang (`bg-brand/10 text-brand-deep border-brand/25`) tanpa ikon atau badge kecil di kanan bawah.
   - **Tampilan Alamat Utuh**: Alamat tempat tinggal tampil 100% tanpa pemotongan titik tiga (`line-clamp-2` dihapus).
   - **Orang Tua / Wali Terdaftar**: Menampilkan seluruh relasi (Ayah, Ibu, Wali) lengkap dengan tautan telepon langsung (`tel:...`).
   - **Dialog Preview Foto**: Mengklik avatar membuka dialog perbesaran foto profil (hanya menampilkan nama lengkap anak tanpa teks NIS).

3. **Mesin Penyimpanan Foto Profil Siswa ([StudentPhotoUpload.tsx](file:///d:/PROJECT/yapendik-tk-pilot/src/components/roster/StudentPhotoUpload.tsx))**:
   - 3 Opsi Aksi Seimbang: 📷 **Kamera** (Webcam/Live Capture), ⬆️ **Unggah Berkas**, ↺ **Reset Default** (Kembali ke avatar inisial).
   - **Supabase Storage Bucket (`student-photos`)**: Berstatus `public = TRUE` dengan limit 5MB dan format JPEG/PNG/WebP.
   - **RPC Update Foto (`rpc_update_student_photo`)**: Mengeksekusi mutasi `students.photo_url` dan `persons.avatar_url` secara aman dengan `SECURITY DEFINER`.
   - **Hybrid Cache-First Fallback**: Foto yang diunggah disimpan ganda ke Cloud dan `localStorage`, menjamin foto tidak pernah hilang atau tereset saat refresh/ganti kelas.

---

## 🔒 2. Matriks Otorisasi & Visibilitas (Authorization Invariants)

Berdasarkan **ADR-01 (Security Invariants)** dan **PostgreSQL RLS Policies ([rls_migration_v2_1_5_hardened.sql](file:///d:/PROJECT/yapendik-tk-pilot/db_migrations/rls_migration_v2_1_5_hardened.sql))**:

| Modul / Domain | Guru TK A $\rightarrow$ Murid TK B | Kepala Sekolah / Admin | Rujukan Dokumen & Fungsi RLS |
|---|:---:|:---:|---|
| **Data Roster (Direktori & Kontak Ortu)** | 🟢 **Bisa Melihat (Read)** | 🟢 **Bisa Melihat (Read)** | `auth_shares_school_with` (Child Safety & Emergency Access) |
| **Unggah & Reset Foto Siswa** | 🟢 **Diizinkan** | 🟢 **Diizinkan** | `rpc_update_student_photo` (SECURITY DEFINER) |
| **Ubah Data Pokok Siswa (NIK / NISN)** | 🔴 **Ditolak (Hidden)** | 🟢 **Diizinkan (Full Edit)** | `canEditMasterData` (`HEADMASTER` & `YAPENDIK_SUPERADMIN`) |
| **Presensi & Jurnal Harian** | 🔴 **Ditolak** | 🟢 **Diizinkan** | `DENY_CLASS_UNASSIGNED` (Terkunci pada `assignedClasses`) |
| **Observasi & Publikasi LPPA** | 🔴 **Ditolak** | 🟢 **Diizinkan (Review/Approve)** | `DENY_CLASS_UNASSIGNED` (Terkunci pada penugasan wali kelas) |

---

## 🗄️ 3. Daftar File Migrasi SQL Resmi

| Versi Migrasi | Nama File | Tujuan |
|---|---|---|
| `20260902040000` | `20260902040000_classes_roster_canonical.sql` | Pendaftaran kelas kanonikal TK Maranatha |
| `20260902050000` | `20260902050000_update_class_nomenclature.sql` | Nomenklatur Kelas TK A & TK B, inisialisasi bucket storage |
| `20260902060000` | `20260902060000_add_student_photo_url.sql` | Kolom `photo_url` pada tabel `students` |
| `20260902070000` | `20260902070000_storage_public_bucket.sql` | Konfigurasi bucket storage publik & RLS policies |
| `20260902080000` | `20260902080000_rpc_update_student_photo.sql` | Fungsi RPC `rpc_update_student_photo` & RLS read policies |

---

## 🔍 4. Status Sertifikasi CI / Guard

- **TypeScript Compilation (`pnpm run lint`)**: ✅ `PASS (0 errors)`
- **Token Purity Audit (`node scripts/token-purity.mjs`)**: ✅ `PASS (0 token violations)`
- **Amanaura Structural Audit (`node scripts/amanaura-audit.mjs`)**: ✅ `PASS (0 violations pada Data Roster)`
