# STAGE 6-A: DEVELOPER HANDOFF & MULTI-ROLE USER GUIDE
## "The Warm Briefing & The Closure Mode" — Operating Companion Manual

**METADATA**

| Atribut | Nilai |
| --- | --- |
| Document ID | `DOC-AMANAURA-STAGE-6A-HANDOFF-USERGUIDE-v1.0` |
| Status | **SEALED & PRODUCTION READY** |
| Governing Specs | `STAGE_6_A_GATE_0_CONTRACT_HARDENING_v1.0.md`, `STAGE_6_A_GATE_1_TECHNICAL_ARCHITECTURE_v1.0.md` |
| Target Audience | Software Engineers, System Integrators, Pendidik PAUD/TK, Kepala Sekolah, Pengurus Yayasan, Wali Murid |
| Design Language | Amanaura v3.0 / v4.0 Padma Modern (Flat Fluid Canvas-Native) |
| Audio Doctrine | Doktrin D-7 Web Audio Harmonic Oscillator (432.0 Hz) |
| Tanggal Terbit | 30 Agustus 2026 |

---

# DAFTAR ISI

- [PART I: DEVELOPER HANDOFF GUIDE](#part-i-developer-handoff-guide)
  - [1.1 Architecture Overview (5-Layer EIA Extension)](#11-architecture-overview-5-layer-eia-extension)
  - [1.2 File Map & Repository Structure](#12-file-map--repository-structure)
  - [1.3 API & RPC Reference](#13-api--rpc-reference)
  - [1.4 State Machines & Pure Deterministic Functions](#14-state-machines--pure-deterministic-functions)
  - [1.5 Invariants & Security Boundaries](#15-invariants--security-boundaries)
  - [1.6 Troubleshooting & Diagnostics](#16-troubleshooting--diagnostics)
- [PART II: USER GUIDE — GURU (PENDIDIK TK)](#part-ii-user-guide--guru-pendidik-tk)
  - [2.1 Membaca Briefing Pagi & Fase Operasional](#21-membaca-briefing-pagi--fase-operasional)
  - [2.2 Ritual Tutup Hari & Sisa Tenang](#22-ritual-tutup-hari--sisa-tenang)
  - [2.3 Gema Hangat (Warm Echo)](#23-gema-hangat-warm-echo)
- [PART III: USER GUIDE — KEPALA SEKOLAH](#part-iii-user-guide--kepala-sekolah)
  - [3.1 Membaca Briefing Manajerial & Rekonsiliasi](#31-membaca-briefing-manajerial--rekonsiliasi)
  - [3.2 Konfigurasi Ritme Satuan Pendidikan (FB-08)](#32-konfigurasi-ritme-satuan-pendidikan-fb-08)
  - [3.3 Mode Penutup Otoritas](#33-mode-penutup-otoritas)
- [PART IV: USER GUIDE — YAYASAN (DEWAN PENGURUS)](#part-iv-user-guide--yayasan-dewan-pengurus)
  - [4.1 Membaca Briefing Multilateral & Siklus Pembelajaran](#41-membaca-briefing-multilateral--siklus-pembelajaran)
  - [4.2 Memahami PrivacyShield (FB-07) & NonCausalDelta (H-02)](#42-memahami-privacyshield-fb-07--noncausaldelta-h-02)
  - [4.3 Stewardship Mingguan](#43-stewardship-mingguan)
- [PART V: USER GUIDE — GUARDIAN (ORANG TUA / WALI MURID)](#part-v-user-guide--guardian-orang-tua--wali-murid)
  - [5.1 Portal Keluarga: Tiga Tab Utama](#51-portal-keluarga-tiga-tab-utama)
  - [5.2 Privasi & Perlindungan Data Anak (FB-09)](#52-privasi--perlindungan-data-anak-fb-09)
  - [5.3 Kamus Keluarga (Padanan Istilah Ramah)](#53-kamus-keluarga-padanan-istilah-ramah)
- [APPENDIX: GLOSSARY & FAQ](#appendix-glossary--faq)

---

# PART I: DEVELOPER HANDOFF GUIDE

## 1.1 Architecture Overview (5-Layer EIA Extension)

Stage 6-A memperluas *Enterprise Information Architecture* (EIA) Yapendik School OS menjadi ekosistem pendamping sirkadian 5-lapis yang deterministik:

```
┌─────────────────────────────────────────────────────────────────────────┐
│ LAYER 5: STORAGE & AUDIO PERIPHERAL                                      │
│  - Web Audio Context (Sine Wave 432Hz Harmonic Oscillator D-7)          │
│  - LocalStorage ('yapendik_sound_closure_enabled', 'yapendik_theme')     │
├─────────────────────────────────────────────────────────────────────────┤
│ LAYER 4: GLASS LAYER UI (Canvas-Native Flat / Hukum F-7)                 │
│  - <BriefingShell /> (Amanaura Breath ✦ 4s Daytime / 8s Nighttime)      │
│  - <TeacherBriefing />, <HeadmasterBriefing />                          │
│  - <FoundationBriefing /> (<PrivacyShield />, <NonCausalDelta />)        │
│  - <GuardianBriefing />, <GuardianWorkspace />                          │
├─────────────────────────────────────────────────────────────────────────┤
│ LAYER 3: STATE MACHINES (Pure Deterministic Functions)                  │
│  - evaluateBriefingMode(time, schedule) -> 'PRATINJAU'|'OPERASIONAL'|.. │
│  - evaluateClosureState(pending, safety) -> 'TUNTAS'|'SISA_TENANG'|..   │
│  - evaluateMessageHolding(msgTime, closeTime, isCritical)               │
│  - canPlay432HzSound(context, hasGesture, prefEnabled)                  │
├─────────────────────────────────────────────────────────────────────────┤
│ LAYER 2: PROJECTION & SERVICE ORCHESTRATION                              │
│  - BriefingEngineService (src/services/BriefingEngine.ts)               │
│  - H-07 Non-Surveillance Integrity Validator (assertNonSurveillance)    │
│  - Canonical Fallback Composer (v1 Vocabulary, T-4)                      │
├─────────────────────────────────────────────────────────────────────────┤
│ LAYER 1: CANONICAL DATABASE SUBSTRATE & TRUSTED RPC                      │
│  - Tables: phase_action_mappings, school_rhythm_configs,                 │
│            guardian_relationships, closure_ritual_ledger                 │
│  - RLS Policies: FB-08 Autonomy, FB-09 Minimization, T-3 Private Ledger  │
│  - RPCs: rpc_get_briefing_data, rpc_update_phase_action_mapping,        │
│          rpc_trigger_closure_ritual                                      │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 1.2 File Map & Repository Structure

Seluruh kode Stage 6-A diorganisasikan secara modular tanpa menyentuh 15 tabel inti beku Stage 4.5:

```text
Database Substrate:
├── db_migrations/m12_stage6a_briefing_and_closure_substrate.sql
├── db_migrations/m12_stage6a_briefing_and_closure_substrate_down.sql
└── supabase/migrations/20260830_create_stage_6a_briefing_tables.sql

Domain Types & State Machines:
├── src/types/briefingTypes.ts
├── src/services/briefing/StateMachines.ts
└── src/services/BriefingEngine.ts

Audio & Ergonomics:
└── src/hooks/useClosureSound.ts

Glass Layer UI Components:
├── src/components/workspaces/briefing/BriefingShell.tsx
├── src/components/workspaces/briefing/TeacherBriefing.tsx
├── src/components/workspaces/briefing/HeadmasterBriefing.tsx
├── src/components/workspaces/briefing/FoundationBriefing.tsx
├── src/components/workspaces/briefing/GuardianBriefing.tsx
└── src/components/workspaces/briefing/index.ts

Workspace Shells & Integrations:
├── src/components/workspaces/teacher/TeacherHomeShell.tsx (Modified)
├── src/workspaces/school/HeadmasterAdoptionLayout.tsx (Modified)
├── src/workspaces/foundation/FoundationLayout.tsx (Modified)
├── src/workspaces/guardian/GuardianWorkspace.tsx (New)
├── src/workspaces/guardian/GuardianMomentsGallery.tsx (New)
├── src/workspaces/guardian/GuardianDevelopmentTimeline.tsx (New)
└── src/App.tsx (Routing #portal-keluarga)

Automated Test Suites (403 Checks Total):
├── tests/stage6a_briefing_backend.test.ts (11 checks)
├── tests/stage6a_briefing_engine.test.ts (29 checks)
├── tests/stage6a_briefing_ui_contracts.test.tsx (Suite 31 - 7 checks)
└── tests/stage6a_foundation_guardian_ui.test.tsx (Suite 32 - 8 checks)
```

---

## 1.3 API & RPC Reference

### 1. `rpc_get_briefing_data`
```sql
FUNCTION public.rpc_get_briefing_data(
    p_role TEXT,
    p_school_id TEXT
) RETURNS JSONB
SECURITY DEFINER
SET search_path = public, auth, pg_temp;
```
- **Kewenangan:** Terotentikasi.
- **Logika:** Mengonversi UTC server ke zona waktu sekolah (`WIB`, `WITA`, `WIT`), mengevaluasi mode sirkadian (`PRATINJAU`, `OPERASIONAL`, `PENUTUP`), dan menyusun payload *discriminated union* sesuai role pemanggil. Untuk Guardian, `child_id` diturunkan murni di server dari tabel `guardian_relationships` (`T-2`).

### 2. `rpc_update_phase_action_mapping`
```sql
FUNCTION public.rpc_update_phase_action_mapping(
    p_school_id TEXT,
    p_phase_id TEXT,
    p_action_id TEXT
) RETURNS JSONB
SECURITY DEFINER;
```
- **Kewenangan:** Khusus Kepala Sekolah unit sekolah terkait (`FB-08`).
- **Logika:** Memvalidasi relasi persona pemanggil dengan `p_school_id`. Memperbarui `quick_action_id` pada fase ritme lokal.

### 3. `rpc_trigger_closure_ritual`
```sql
FUNCTION public.rpc_trigger_closure_ritual(
    p_closure_state TEXT,
    p_pending INT,
    p_safety INT,
    p_reflection TEXT DEFAULT NULL
) RETURNS JSONB
SECURITY DEFINER;
```
- **Kewenangan:** Pendidik / Staf unit.
- **Logika:** Memvalidasi `p_safety == 0`. Jika terdapat alert keselamatan aktif, membatalkan eksekusi dengan exception `CLOSURE_BLOCKED_BY_SAFETY`. Mencatat entri harian ke `closure_ritual_ledger` secara idempotensial (`(teacher_user_id, ritual_date)`).

### 4. `BriefingEngineService` Methods
- `getBriefingDataForUser(role, schoolId, userId?)`: Mengambil data briefing dengan sanitasi anti-surveilans `assertNonSurveillance` (H-07).
- `updatePhaseActionMapping(schoolId, phaseId, actionId, callerContext?)`: Memperbarui konfigurasi ritme dengan validasi otoritas KS (FB-08).
- `triggerClosureRitual(closureState, pendingCount, safetyCount, reflection?, callerContext?)`: Mengeksekusi penutup hari dengan validasi keselamatan.

---

## 1.4 State Machines & Pure Deterministic Functions

Semua fungsi state machine bersifat **murni (zero side-effect, zero database I/O)** dan dapat diuji secara independen:

```typescript
// 1. Resolusi Waktu Sirkadian (T-1)
resolveSchoolLocalTime(serverUtc: Date, timezone: 'WIB' | 'WITA' | 'WIT'): { localDate: Date; localTimeString: string }

// 2. Evaluasi Mode Sirkadian
evaluateBriefingMode(currentTime: Date, schedule: SchoolRhythmConfig): 'PRATINJAU' | 'OPERASIONAL' | 'PENUTUP'

// 3. Evaluasi Status Penutup Hari (T-3)
evaluateClosureState(pendingTasks: PendingTaskPredicate, safetyAlertsCount: number): 'TUNTAS' | 'SISA_TENANG' | 'BYPASSED'

// 4. Penahanan Pesan Malam Hari (D-8)
evaluateMessageHolding(messageTimestamp: Date, schoolClosingTime: Date | string, isCriticalSafety: boolean, timezone?: SchoolTimezone): 'HOLD_UNTIL_MORNING' | 'DELIVER_IMMEDIATELY'

// 5. Gerbang Denting 432Hz (D-7)
canPlay432HzSound(context: SoundTriggerContext, hasUserGesture: boolean, preferenceEnabled: boolean): boolean
```

---

## 1.5 Invariants & Security Boundaries

1. **FB-08 (School Rhythm Autonomy):** Konfigurasi ritme dan pemetaan aksi adalah hak mutlak Kepala Sekolah unit. Yayasan dan Superadmin secara struktural diblokir oleh RLS untuk mengubah jadwal/fase unit lain.
2. **FB-09 (Guardian Data Minimization):** Wali murid hanya menerima data, foto, dan capaian perkembangan anak yang terikat secara sah. Dilarang merender nama atau foto anak lain di DOM.
3. **H-07 (Non-Surveillance Integrity):** Dilarang keras menyisipkan metrik komparatif, ranking guru/siswa, persentil ketuntasan, atau *leaderboard* ke dalam payload dan DOM briefing.
4. **T-3 (Non-Aggregable Teacher Ledger):** Catatan penutup hari guru tidak boleh diagregasi ke tingkat sekolah atau yayasan sebagai KPI kecepatan kerja.
5. **D-7 (Earned/Intentional Audio Gate):** Denting 432Hz hanya boleh dibunyikan saat pengguna menekan aksi fisik bernilai tuntas (*earned task*) atau ritual penutup (*intentional tap*). Autoplay saat navigasi atau cold open dilarang mutlak.
6. **D-8 (Right to Rest):** Pesan non-darurat yang dikirim setelah jam operasional sekolah otomatis berstatus `HOLD_UNTIL_MORNING` untuk melindungi hak istirahat pendidik.

---

## 1.6 Troubleshooting & Diagnostics

| Gejala | Penyebab Umum | Solusi Perbaikan |
|---|---|---|
| Briefing tidak muncul / blank | Token sesi tidak memiliki `role` valid atau koneksi database terputus. | BriefingEngine otomatis beralih ke *canonical fallback composer* v1 (`T-4`). Pastikan persona terotentikasi. |
| Denting 432Hz tidak berbunyi | 1. Browser memblokir autoplay tanpa gesture fisik.<br>2. Toggle suara di localStorage bernilai `false`. | 1. Pastikan pemanggilan terjadi di dalam `onClick` event handler.<br>2. Periksa status ikon volume di header atau toggle `yapendik_sound_closure_enabled`. |
| Error `FORBIDDEN_RHYTHM_MUTATION` | Persona yang mencoba mengubah pemetaan aksi bukan Kepala Sekolah unit terkait. | Pastikan `currentPersona.role === 'HEADMASTER'` dan `schoolId` cocok dengan unit sekolah aktif. |
| Error `CLOSURE_BLOCKED_BY_SAFETY` | Terdapat alert darurat/kesehatan anak aktif yang belum ditangani. | Tangani atau selesaikan insiden keselamatan medis anak sebelum menutup hari. |
| Wali murid tidak melihat galeri foto | Relasi anak-wali belum diverifikasi di tabel `guardian_relationships`. | Pastikan admin/sekolah telah mendaftarkan relasi NIK wali dan anak pada sistem penerimaan siswa. |

---

# PART II: USER GUIDE — GURU (PENDIDIK TK)

Selamat datang di ruang kerja harian Anda. Yapendik School OS kini hadir sebagai **kolega yang tenang**, mendampingi Anda di setiap sentra tanpa membebani administrasi yang rumit.

```
+-------------------------------------------------------------------------+
| [Senin, 31 Agustus 2026 • 08:15]                                   (🔊) |
|                                                                         |
| Selamat pagi, Bu Siti                                                 ✦ |
|                                                                         |
| 🕒 Sekarang waktu Main Sentra                                           |
| [ ✨ Rekam Momen Sentra ]  <-- Tombol Aksi Cepat 1-Ketukan             |
|                                                                         |
| Presensi lengkap • 2 draf observasi • 1 pesan menanti                   |
|                                                                         |
| | Gema Hangat • Bunda Kenzo                                             |
| | "Terima kasih Bu Siti, Kenzo sangat senang bercerita tentang balok."  |
+-------------------------------------------------------------------------+
```

## 2.1 Membaca Briefing Pagi & Fase Operasional

Saat Anda membuka aplikasi di pagi hari:
1. **Sapaan Personal & Sirkadian:** Aplikasi menyapa Anda sesuai nama dan waktu lokal sekolah.
2. **Amanaura Breath (`✦`):** Bintang kecil di samping nama Anda berdenyut lembut setiap 4 detik (menandakan ritme aktivitas sekolah sedang berlangsung aktif).
3. **Fase Aktif Saat Ini:** Sistem secara otomatis mendeteksi fase ritme sekolah (misal: *Sambut Ananda*, *Main Sentra*, *Makan Bekal*, atau *Sintesis*).
4. **Tombol Aksi Utama Dominan:** Anda tidak perlu mencari menu di sidebar; tombol aksi yang paling relevan dengan fase saat ini langsung tersedia di layar utama (misal: tombol `[ Rekam Momen Sentra ]` saat jam sentra).
5. **Ringkasan Ringan (*Micro-Summary*):** Indikator ramah yang mengingatkan status presensi kelas dan jumlah draf catatan yang tersimpan.

---

## 2.2 Ritual Tutup Hari & Sisa Tenang

Ketika jam kepulangan sekolah telah usai (setelah pukul 14:30):

```
+-------------------------------------------------------------------------+
| [Senin, 31 Agustus 2026 • 15:00]                                   (🔊) |
|                                                                         |
| Hari ini selesai, Bu Siti.                                            ✦ |
|                                                                         |
| 15/15 hadir • 4 momen terekam • 2 pesan dibalas                         |
|                                                                         |
| [ ✓ Tutup Hari ]  <-- Sentuh untuk Menyudahi Hari                       |
+-------------------------------------------------------------------------+
```

1. **Peralihan ke Mode Penutup:** Layar utama berubah tenang. Tanda `✦` melambat menjadi denyut santai 8 detik.
2. **Ringkasan Tanpa Tekanan:** Anda melihat rekap hal-hal baik yang telah Anda lakukan hari ini (jumlah anak hadir, momen terekam, dan komunikasi dengan orang tua).
3. **Sentuh Tombol `[ Tutup Hari ]`:**
   - Sistem mencatat penutupan hari Anda di buku harian privat.
   - Denting lembut **432Hz** berbunyi memberikan rasa lega dan apresiasi atas dedikasi Anda.
   - **Prinsip Sisa Tenang:** Jika masih ada draf observasi yang belum selesai, sistem **TIDAK AKAN** menampilkan warna merah atau peringatan yang memicu kecemasan. Sistem hanya berpesan: *"Catatan tersimpan tenang menemani Anda besok pagi. Selamat beristirahat."*

---

## 2.3 Gema Hangat (Warm Echo)

Di bagian bawah briefing harian, Anda akan menemukan kutipan singkat berisi apresiasi dari orang tua murid atau refleksi kualitatif sentra. Bagian ini hadir untuk menyiram semangat dan menegaskan makna dari setiap momen bermain yang Anda dampingi.

---

# PART III: USER GUIDE — KEPALA SEKOLAH

Sebagai pemimpin satuan pendidikan, Anda memerlukan pandangan helikopter yang jernih terhadap keharmonisan operasional sekolah tanpa terjebak dalam micromanagement.

```
+-------------------------------------------------------------------------+
| [Senin, 31 Agustus 2026 • 08:00]                                        |
|                                                                         |
| Selamat pagi, Pak Andreas                                             ✦ |
|                                                                         |
| [ 🛡️ Rekonsiliasi ]       [ 📄 Otoritas ]          [ 👥 Kemitraan ]     |
|       3/3 Kelas                 2 LPPA                 0 Pesan          |
|      Kelas tuntas            Menunggu sah           Buku penghubung     |
|                                                                         |
| [ Tinjau Antrean Otoritas ➔ ]                                           |
|                                                                         |
| | Refleksi Pendidik • Bu Siti Nurhaliza                                 |
| | "Anak-anak sangat antusias bereksplorasi di sentra balok hari ini."   |
+-------------------------------------------------------------------------+
```

## 3.1 Membaca Briefing Manajerial & Rekonsiliasi

Briefing Kepala Sekolah menyajikan **3 Pilar Utama**:
1. **Rekonsiliasi Kelas:** Mengetahui berapa kelas yang telah menuntaskan presensi pagi dan memastikan nihil insiden medis/keselamatan.
2. **Antrean Otoritas:** Jumlah draf LPPA atau kebijakan unit yang menunggu persetujuan dan pengesahan resmi Anda.
3. **Kemitraan:** Denyut komunikasi dan buku penghubung dengan para orang tua murid.
4. **Tombol Tinjau Antrean:** Satu ketukan langsung mengarahkan Anda ke berkas yang paling membutuhkan tanda tangan digital Anda.

---

## 3.2 Konfigurasi Ritme Satuan Pendidikan (FB-08)

Sesuai doktrin **Kedaulatan Satuan Pendidikan (FB-08)**, Anda memiliki hak penuh untuk menentukan ritme harian sekolah Anda:

1. Masuk ke menu **Pengaturan Sekolah** $\rightarrow$ **Ritme & Fase Sirkadian**.
2. Anda dapat mengatur jam buka (*School Opening*), jam pulang (*School Closing*), serta zona waktu sekolah (`WIB`, `WITA`, atau `WIT`).
3. Pada setiap fase (misal: *Sambut Ananda*, *Main Sentra*, *Makan Bekal*, *Sintesis*), Anda bebas menetapkan tombol aksi cepat yang akan muncul di layar guru-guru Anda.
4. **Jaminan Otonomi:** Pengaturan ini tersimpan eksklusif untuk unit TK Anda. Yayasan tidak memiliki hak akses untuk memaksakan jadwal unit lain ke sekolah Anda.

---

## 3.3 Mode Penutup Otoritas

Di sore hari, briefing Anda menyajikan rekap manajerial: jumlah dokumen yang berhasil disahkan hari ini, status keselamatan sekolah yang hijau, dan kutipan refleksi kualitatif dari guru-guru Anda sebelum Anda menutup hari kerja kepemimpinan.

---

# PART IV: USER GUIDE — YAYASAN (DEWAN PENGURUS)

Bagi jajaran Dewan Pengurus dan Pengawas Yayasan, *The Warm Briefing* menyediakan konsol stewardship multi-unit yang beretika, bebas bias kausalitas palsu, dan melindungi privasi anak secara matematis.

```
+-------------------------------------------------------------------------+
| [Senin, 31 Agustus 2026]                                                |
|                                                                         |
| Selamat pagi, Bu Ketua                                                ✦ |
|                                                                         |
| [ 🏛️ Keputusan ]         [ 📈 Kesehatan Loop ]      [ ⚖️ Sinyal Equity ] |
|      3 Insight                 2 Adopsi                 2 Pola          |
|    Tertua 4 hari          1 refleksi tertunda       🔒 Kohor Terlindungi|
|                                                                         |
| [ Telaah Insight Kebijakan ➔ ]                                          |
| ℹ️ Asosiasi empiris teramati antarsekolah, bukan kausalitas (H-02).     |
+-------------------------------------------------------------------------+
```

## 4.1 Membaca Briefing Multilateral & Siklus Pembelajaran

Briefing Yayasan berfokus pada dinamika antar-satuan pendidikan:
1. **Antrean Keputusan Dewan:** Rekomendasi kebijakan kurikulum atau bantuan loose-parts yang telah ditinjau dan siap disetujui.
2. **Kesehatan Loop Pembelajaran:** Memantau respons adopsi kebijakan oleh sekolah-sekolah di bawah naungan Yayasan.
3. **Sinyal Equity:** Mendeteksi variasi capaian bermain lintas unit untuk penyaluran bantuan sarana prasarana yang adil.

---

## 4.2 Memahami PrivacyShield (FB-07) & NonCausalDelta (H-02)

Konsol Yayasan dilengkapi dua pengaman etis utama:
- **Badge Frosted `<PrivacyShield />` (FB-07):** Jika sebuah data observasi berasal dari kelompok kecil kurang dari 5 anak ($N < 5$), angka individual otomatis dikunci dan dilindungi (*Suppressed*) untuk mencegah siapa pun menebak identitas anak tertentu.
- **Catatan Kaki `<NonCausalDelta />` (H-02):** Setiap angka perubahan selalu disertai pengingat bahwa dinamika kelas PAUD adalah asosiasi teramati, bukan hubungan sebab-akibat yang kaku.

---

## 4.3 Stewardship Mingguan

Berbeda dengan Guru dan KS yang beroperasi harian, briefing Yayasan beroperasi dalam siklus mingguan (*Weekly Stewardship Cycle*), merangkum adopsi kebijakan dan suara refleksi kualitatif para Kepala Sekolah di akhir pekan.

---

# PART V: USER GUIDE — GUARDIAN (ORANG TUA / WALI MURID)

Portal Keluarga Yapendik adalah jendela hangat yang menghubungkan rumah dengan sekolah, dirancang dengan bahasa yang penuh kasih dan bebas dari angka-angka perbandingan.

```
+-------------------------------------------------------------------------+
| [ 💖 Portal Keluarga • TK Yapendik ]             (Bunda Kenzo) [Segarkan]|
| ----------------------------------------------------------------------- |
| [  💖 Hari Ini  ]   [  📷 Momen & Karya  ]   [  📖 Perkembangan  ]     |
| ----------------------------------------------------------------------- |
|                                                                         |
| Selamat pagi, Bunda Kenzo                                             ✦ |
|                                                                         |
| +---------------------------------------------------------------------+ |
| | 💖 Kabar Kenzo Hari Ini                                             | |
| | Kenzo hadir di sekolah • makan siang habis • sedang bermain sentra  | |
| +---------------------------------------------------------------------+ |
|                                                                         |
| [ 📷 Momen Terkini • 09:30 WIB ]                                       |
| Membangun jembatan balok bersama teman-teman di sentra konstruksi.     |
|                                                                         |
| | "Kenzo sangat fokus dan berbagi balok dengan rukun hari ini."         |
|                                                                         |
| [ Lihat Momen & Karya Hari Ini ➔ ]                                      |
+-------------------------------------------------------------------------+
```

## 5.1 Portal Keluarga: Tiga Tab Utama

1. **Tab "Hari Ini" (Surat Pagi & Surat Sore):**
   - **Pagi/Siang:** Mendapatkan kabar terkini tentang kehadiran anak, status makan siang, dan sentra yang sedang dimainkan.
   - **Sore Hari ("Surat Sore"):** Menampilkan rangkuman sore yang hangat tentang keceriaan anak hari ini, menyambut kepulangan ananda ke tengah kehangatan keluarga.
2. **Tab "Momen & Karya":**
   - Galeri foto autentik saat anak bermain di sentra.
   - Sentuh foto untuk memperbesar dengan tampilan layar penuh yang jernih.
3. **Tab "Perkembangan":**
   - Rangkuman pertumbuhan anak dalam bahasa yang mudah dipahami.
   - Tombol `[ Baca Laporan Perkembangan Utuh ]` untuk membaca dokumen LPPA resmi yang telah disahkan Kepala Sekolah.

---

## 5.2 Privasi & Perlindungan Data Anak (FB-09)

- Anda **hanya akan melihat** foto dan dokumentasi yang menandai anak Anda sendiri. Foto anak lain tidak akan pernah muncul di galeri keluarga Anda.
- Seluruh laporan yang Anda terima adalah dokumen final yang telah diverifikasi dan disahkan oleh Kepala Sekolah.
- **Nol Skor & Nol Peringkat:** Tidak ada peringkat kelas atau perbandingan antar-anak. Setiap anak dipandang unik dan dihargai menurut tempo perkembangannya masing-masing.

---

## 5.3 Kamus Keluarga (Padanan Istilah Ramah)

Aplikasi secara konsisten menggunakan istilah kekeluargaan:

| Istilah Teknis Pendidikan | Istilah di Portal Keluarga |
|---|---|
| Domain STEAM & Literasi Awal | **Literasi & Eksplorasi Main** |
| Nilai Agama dan Moral (NAM) | **Nilai Agama & Karakter** |
| Motorik & Sosial Emosional | **Jati Diri & Kemandirian** |
| Laporan Hasil Belajar (LPPA) | **Laporan Perkembangan Ananda** |
| Sentra Konstruksi / Loose Parts | **Sentra Balok & Bahan Alam** |

---

# APPENDIX: GLOSSARY & FAQ

### Glossary

- **The Warm Briefing:** Lapisan antarmuka sirkadian adaptif yang menyapa pengguna dengan konteks relevan sesuai perannya.
- **The Closure Mode:** Ritual penutupan hari yang menandai berakhirnya shift kerja secara emosional dan sistemik.
- **Sisa Tenang:** Prinsip desain di mana tugas yang belum selesai disimpan secara damai untuk esok hari tanpa label merah menyala atau sanksi rasa bersalah.
- **Denting 432Hz:** Frekuensi audio harmonis alami yang dibangkitkan Web Audio API saat ritual penutup hari dijalankan.
- **Kamus Keluarga:** Penerjemahan istilah kurikulum PAUD ke dalam bahasa naratif yang komunikatif bagi orang tua.
- **PrivacyShield:** Komponen pelindung privasi yang secara otomatis menyembunyikan ukuran sampel data kecil ($N < 5$).

---

### FAQ (Pertanyaan yang Sering Diajukan)

**Q: Apakah data jam penutupan hari guru bisa dipantau Kepala Sekolah untuk penilaian disiplin?**
> **A:** Tidak bisa. Sesuai doktrin arsitektural **T-3 (Non-Aggregability)**, tabel `closure_ritual_ledger` bersifat privat per guru dan dilarang secara hukum sistem untuk diagregasi menjadi instrumen pengawasan performa kerja.

**Q: Bagaimana jika koneksi internet terputus saat guru menekan tombol Tutup Hari?**
> **A:** Denting 432Hz dan penutupan antarmuka tetap berjalan seketika di perangkat lokal (*Offline-First*). Data penutupan akan disinkronisasikan secara otomatis saat perangkat kembali terhubung.

**Q: Mengapa orang tua tidak dapat melihat skor persentil perkembangan anak?**
> **A:** Yapendik School OS memegang teguh filosofi pendidikan holistik (H-07 & FB-04). Perkembangan anak usia dini diukur melalui narasi kualitatif dan portofolio karya nyata, bukan pemeringkatan angka yang mereduksi keunikan ananda.

**Q: Apakah suara denting 432Hz dapat dimatikan jika guru sedang berada di ruang hening?**
> **A:** Tentu. Terdapat tombol ikon volume di sudut kanan atas briefing yang dapat dimatikan kapan saja (*preference* akan tersimpan secara otomatis).

---

> *Dokumen ini adalah panduan resmi untuk adopsi Stage 6-A oleh tim pengembang dan pengguna akhir.*  
> **Yapendik School OS — Menghidupkan Ekosistem Pendidikan yang Hangat, Humanis, dan Bermartabat.** 🏛️✨
