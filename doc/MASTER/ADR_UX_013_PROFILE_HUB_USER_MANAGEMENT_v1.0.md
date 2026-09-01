# ADR-UX-013: Profile Hub v2, CR80 Digital Name Card & Supabase User Management

**Status:** RATIFIED & FROZEN  
**Date:** 2026-09-01  
**Author:** Architecture Review Board (ARB) & Gemini Core  
**Domain:** Security Architecture, User Management, Tactile Identity & Visual Credentials  

---

## 1. Context & Architectural Principles

Melanjutkan pemurnian arsitektur antarmuka pada ADR-UX-012, profil pengguna bertransformasi dari sekadar laci preferensi sederhana menjadi **Profile Hub v2** — pusat kendali identitas, keamanan kanonikal, dan kredensial digital pendidik.

Prinsip fundamental:
1. **Single Point of Identity Truth**: Data personal (nama, telepon, foto) dikelola secara mandiri oleh pemilik akun dengan pembatasan otorisasi ketat (Owner-Only Mutation via Security Definer RPCs).
2. **Canonical Identity Immuntability**: Email akun adalah pengenal autentikasi primer yang bersifat *immutable* bagi pengguna biasa.
3. **Tactile Digital Credentials (CR80 "Agung")**: Kartu nama digital pendidik berformat standar internasional CR80 (85.6×54mm) yang memadukan keanggunan budaya Nusantara (*Padma & Gunungan* watermark, sudut ornamen kuningan, tipografi *Instrument Serif*) dengan verifikasi kriptografis berbasis QR Code bebas kredensial.
4. **Gradual Biometric Onboarding**: Aktivasi login biometrik (sidik jari / passkey) diawali dengan *soft-toggle* preferensi akun, menyiapkan pendaftaran WebAuthn penuh pada sprint berikutnya.

---

## 2. Database Schema & Storage Bucket Architecture

### 2.1 Schema Extensions (`persons` Table)
```sql
ALTER TABLE persons ADD COLUMN IF NOT EXISTS avatar_url text NULL;
ALTER TABLE persons ADD COLUMN IF NOT EXISTS phone text NULL;
ALTER TABLE persons ADD COLUMN IF NOT EXISTS passkey_enabled boolean NOT NULL DEFAULT false;
ALTER TABLE persons ADD COLUMN IF NOT EXISTS passkey_registered_at timestamptz NULL;
```

### 2.2 Storage Bucket: `staff-avatars`
* **Bucket Configuration**: Public read-accessible bucket dengan validasi kepemilikan direktori berbasis `auth.uid()`.
* **Client-Side Image Guard**: Sebelum diunggah ke storage, foto profil di-downscale melalui HTML5 Canvas API (maksimum 512×512 piksel, rasio kualitas JPEG 0.85, batas berkas $\le 2\text{ MB}$, MIME `image/jpeg` atau `image/png`).

### 2.3 Storage RLS Security Policies
```sql
CREATE POLICY "Avatar owner read" ON storage.objects
  FOR SELECT USING (bucket_id = 'staff-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Avatar owner write" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'staff-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Avatar owner update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'staff-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Avatar owner delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'staff-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Avatar public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'staff-avatars');
```

---

## 3. Owner-Only RPC Contracts & Email Immutability Rule

### 3.1 5 Canonical RPC Functions
1. `rpc_update_own_avatar(new_url text)`: Memperbarui URL foto profil pada tabel `persons` berdasarkan `auth.uid()`.
2. `rpc_update_own_phone(new_phone text)`: Memperbarui nomor telepon setelah memvalidasi format internasional (regex `^(\+62|0)[0-9\s\-]{8,15}$`).
3. `rpc_update_own_name(new_name text)`: Memperbarui nama lengkap (panjang 2–100 karakter).
4. `rpc_toggle_passkey_enabled(enabled boolean)`: Mengaktifkan atau menonaktifkan preferensi login biometrik dan mencatat waktu registrasi.
5. `rpc_get_own_profile()`: Mengambil proyeksi identitas terpadu (`full_name`, `email`, `phone`, `avatar_url`, `role`, `assigned_class`, `passkey_enabled`).

### 3.2 Doktrin Email Immutability
> **Aturan Konstitusional ARB**: Alamat email adalah identitas kanonikal user di Supabase Auth. Perubahan email **TIDAK diizinkan** melalui RPC tingkat pengguna. Perubahan email hanya dapat dieksekusi oleh peran `YAPENDIK_SUPERADMIN` melalui Supabase Admin API (`supabase.auth.admin.updateUserById()`). Pada antarmuka pengguna, email ditampilkan dalam format *readonly disabled* dengan penanda status yang jelas.

---

## 4. CR80 "Agung" Name Card & Instrument Serif Allowlist Expansion

### 4.1 Spesifikasi Dimensi & Tata Letak CR80
* **Format Fisik**: Landscape $85.6\text{ mm} \times 54\text{ mm}$ (rasio aspek $1.585:1$).
* **Format Ekspor**: SegmentedControl `[ PDF | PNG ]` (Threshold Rule §4.2).
  * **PDF**: Vektor cetak CR80 resolusi tinggi via `jspdf`.
  * **PNG**: Berkas grafis digital 300 DPI via `html2canvas`.

### 4.2 Elemen Estetika & Ornamen
* **Tipografi Nama**: Menggunakan **Instrument Serif** ($22\text{pt}$, allowlist diperluas).
* **Metadata & Kontak**: Menggunakan **Plus Jakarta Sans** ($11\text{pt}$) dan **Geist Mono** untuk nomor telepon.
* **Watermark Budaya**: Siluet **Padma & Gunungan** di latar belakang dengan opasitas $\le 4\%$.
* **Sudut Khas**: Ornamen kuningan (*brass filigree*) pada 4 sudut dengan opasitas $15\%$.
* **QR Code Terverifikasi**: Menghasilkan QR Code yang berisi tautan publik kanonikal aplikasi (regex `/^https:\/\/[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,}/`). Payload QR **DIJAMIN BERSIH** dari `token`, `session`, `password`, atau rahasia sesi apa pun.

### 4.3 Perluasan Allowlist Instrument Serif
Doktrin tipografi Amanaura Design System §3.3 diperluas secara resmi untuk mencakup:
1. Seremonial Greeting / Salam Beranda
2. Kutipan Hangat Warm Echo Carousel
3. Brand Header "Amanaura OS ✦"
4. **Kartu Nama Digital Pendidik & Kartu Keluarga (CR80 Profile & Family Name Card)**

### 4.6 Kebijakan URL Kanonikal QR (QR Canonical URL Policy)
QR Code pada Kartu Nama Digital Staf dan Kartu Keluarga Wali memuat URL publik aplikasi (`https://tkm.amanloka.com`) sebagai gerbang scannable terverifikasi. Konfigurasi ini mendukung fleksibilitas dua lapis melalui variabel lingkungan `VITE_APP_URL` dengan fallback ke domain produksi kanonikal. Saat aplikasi beralih ke domain produksi institusi (`yapendik.sch.id`), kartu baru otomatis mengikuti domain baru via `VITE_APP_URL`, sedangkan kartu yang telah dicetak sebelumnya tetap valid melalui pengalihan (*301 redirect*).

---

## 5. Deferred Work Items (Tata Kelola Tertunda)

* **#DW-01 — Panduan Pasang Aplikasi (PWA / iOS Guide)**:
  * Tombol panduan statis dihilangkan dari lembar navigasi mobile untuk menjaga ketenangan visual (*Calm & Dignified*).
  * Tombol instalasi otomatis hanya muncul saat browser memicu *install prompt*. Panduan manual komprehensif dialokasikan ke fase uji coba lapangan (*field trials*).
* **#DW-02 — Passkey WebAuthn Backend & Registrasi Biometrik Penuh**:
  * Sprint ini menerapkan *soft-toggle* preferensi `passkey_enabled` dan integrasi tombol pada login screen dengan dialog edukatif.
  * Implementasi pendaftaran kunci publik WebAuthn (`webauthn_credentials`, autentikasi FIDO2/WebAuthn API, dan RPC pendaftaran penuh) dijadwalkan sebagai satu sprint tersendiri.

---

## 6. Addendum X: Persona-Aware Name Card — Guardian Family Card (Kartu Keluarga)

### 6.1 Latar Belakang & Justifikasi Praktik PAUD
Pada ekosistem PAUD/TK, kartu identitas bagi orang tua/wali murid berfungsi ganda sebagai **Kartu Verifikasi Antar-Jemput (Pickup Verification Card)**. Guru dan staf penjemputan perlu mencocokkan wajah anak dan nama orang tua dalam satu detik saat kepulangan sekolah.

### 6.2 Pagar Privasi & Tata Kelola Keamanan (ARB Privacy Shield)
1. **Pencegahan Kebocoran Identitas Negara**:
   - Dilarang keras mencetak **NIK (16 digit)** maupun **NIS (10 digit)** anak pada permukaan kartu fisik/digital.
2. **Sanitasi QR Payload**:
   - QR Code memuat strictly URL publik aplikasi (`https://...`), bebas dari parameter sesi, kredensial, atau token autentikasi.
3. **Hak Pembuatan & Percabangan Persona**:
   - Varian *Kartu Keluarga* hanya di-generate jika persona aktif adalah `GUARDIAN` untuk anak yang terdaftar secara sah dalam `guardian_relationships`.
   - Persona staf institusi (`TEACHER`, `HEADMASTER`, `SUPERADMIN`, `FOUNDATION`) tetap menghasilkan kartu kredensial profesional pendidik.

### 6.3 Anatomi Kartu Keluarga (CR80 Landscape 85.6 × 54 mm)
- **Top Header**: Eyebrow `✦ AMANAURA OS` di kiri dan label resmi `KARTU KELUARGA` di kanan.
- **Visual Anchor (Kiri)**: Foto anak atau `AvatarChild` pastel deterministik dengan simbol zodiak/afeksi (Signature #5).
- **Identitas Anak (Kanan Avatar)**: Nama lengkap/panggilan anak diformat dengan **Instrument Serif** (anchor seremonial sah), diikuti subjudul kelas (`Kelas TK A`).
- **Blok Orang Tua & Wali**: Nama wali pemegang kartu (`Orang Tua / Wali: [Nama Wali] (Relasi)`) dan daftar wali terkait (`Terkait: [Nama Wali Lain] (Relasi)`).
- **Zona Kontak & Verifikasi (Bawah)**: Email dan nomor telepon wali (monospace), watermark Padma & Gunungan ($\le 4\%$), ornamen sudut kuningan ($15\%$), serta QR Code dengan label `TERVERIFIKASI`.

### 6.4 Penutupan Watch-Items (W-16 & W-17 Micro-Patches)
1. **W-16 — Harmonisasi Tipografi Title Case Staf**:
   - Seluruh nama staf pada Kartu Nama Digital diformat dengan *Title Case* yang konsisten (`formatTitleCase(profile.name)` → `Erna Boykela R`), menghapus inkonsistensi ALL-CAPS dan menciptakan keharmonisan visual keluarga artefak kartu.
2. **W-17 — Jalur Foto Anak & Graceful Fallback**:
   - Varian Kartu Keluarga mendukung tautan foto aktual anak via `familyInfo.childAvatarUrl` yang dirender dalam squircle kanvas & DOM, dengan penanganan kesalahan otomatis (*error fallback*) ke `AvatarChild` pastel + simbol deterministik saat foto tidak tersedia atau gagal dimuat.

---

*Disahkan secara konstitusional oleh Architecture Review Board (ARB) pada 1 September 2026.*
