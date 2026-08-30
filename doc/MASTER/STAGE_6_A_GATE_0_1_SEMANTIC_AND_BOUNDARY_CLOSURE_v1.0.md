# STAGE 6-A — GATE 0.1: SEMANTIC & BOUNDARY CLOSURE
## Final Pre-Implementation Authority, Invariants, & Boundary Governance Specification (v1.0)
### Yapendik School OS — Early Childhood Context-Aware Operating Companion

**META**

| Atribut | Nilai |
| --- | --- |
| Document ID | `DOC-AMANAURA-STAGE-6A-GATE0.1-v1.0` |
| Version | `v1.0.0-SEALED` |
| Governing Tier | `LEVEL 2 — STAGE 6 STRATEGIC GROWTH DOMAIN` |
| Status | `GATE 0.1 SEALED — READY FOR GATE 1 TECHNICAL DESIGN & SCHEMA` |
| Authoritative Date | `2026-08-30` |
| Source Ratification | Ratified by Senior Architecture Reviewer (ARB) with Tightening Notes T-1 s.d. T-4 |
| Prerequisite Stages | Stage 4.5 LEARN (SEALED) + Stage 5 Hardening + Stage 6-A Gate 0 (SEALED) |
| Target Codebase | `yapendik-tk-pilot` |
| Classification | ARCHITECTURAL CONSTITUTION — GATE 0.1 SEALED |

---

## 0. ATURAN MUTLAK GATE 0.1 (CANONICAL CONSTRAINTS)

Sesuai dengan ketetapan Architecture Review Board (ARB):
1. **Zero Implementation Code:** DILARANG membuat atau memodifikasi file `.tsx`, `.jsx`, atau `.css` pada Gate 0.1.
2. **Zero Schema Migration:** DILARANG mengeksekusi migrasi database SQL (`.sql`) pada Gate 0.1.
3. **Formal Resolution of Tightening Notes:** Seluruh catatan ARB (**T-1**, **T-2**, **T-3**, **T-4**) dikunci sebagai keputusan arsitektur formal (**Keputusan 6A-1 s.d. 6A-8**).
4. **Frozen Core Inviolability:** Penambahan domain Briefing & Closure Mode DILARANG mengubah atau merusak 15 tabel kanonikal V2.1.5 serta baseline 348 checks PASS.

```text
════════════════════════════════════════════════════════════════════════════════════════════
                 STAGE 6-A GOVERNANCE & AUTHORITY TRANSMISSION HORIZON
════════════════════════════════════════════════════════════════════════════════════════════

   [ YAYASAN CONTEXT ]          [ KEPALA SEKOLAH CONTEXT ]          [ GURU CONTEXT ]
   (Stewardship & Siklus)       (Otoritas & Ritme Lokal)            (Ritme Kelas & Penutup)
   ───────────────────────      ──────────────────────────          ───────────────────────
   • Siklus Dewan (Mingguan)    • Hak Eksklusif Ritme (FB-08)       • Alur Sirkadian Harian
   • K-Anonymity (FB-07)        • Rekonsiliasi & Antrean            • Ghost CTA [Tutup Hari]
   • Zero PII Exposure (FB-01)  • Pengesahan LPPA                   • Non-Aggregable Ritual
              │                             │                                  │
              └──────────────┬──────────────┴──────────────────────────────────┘
                             ▼
              [ BRIEFING & CLOSURE ENGINE ]
              • Evaluasi Sirkadian berbasis Zona Waktu Sekolah (T-1)
              • Server-Derived Child Scope untuk Guardian (T-2)
              • Non-Surveillance & Non-Guilt Guarantee (H-07 / T-3)
              • Kosakata Ritme Terversi v1 (T-4)
              • Suara 432Hz Earned/Intentional Only (D-7)
              • Hak Istirahat & Penahanan Pesan (D-8)
                             │
                             ▼
              [ GUARDIAN CONTEXT (IKATAN) ]
              • Server-Derived Scope (Zero Parameter Attack)
              • Foto Bertanda Sahaja (FB-09)
              • Kamus Keluarga (Non-Kuantitatif)
```

---

## 1. MATRIKS OTORITAS & TRANSMISI OPERASIONAL

Matriks berikut mendefinisikan batas kewenangan mutlak antar-peran terhadap seluruh operasi di dalam domain Briefing & Ritual Penutup:

| Operasi Layanan / Endpoint | Guru | Kepala Sekolah | Pengurus Yayasan | Guardian (Wali Murid) | Batas Penegakan & Aturan Invarian |
| :--- | :---: | :---: | :---: | :---: | :--- |
| `getBriefingData(role)` | 🟢 (Unit & Tugas Sendiri) | 🟢 (Unitnya) | 🟢 (Agregat Multi-Unit) | 🟢 (Server-Derived Scope) | **T-2 / FB-01 / FB-07:** Guardian tidak mengirim parameter anak; Yayasan disupresi jika $N < 5$. |
| `getSchoolRhythmConfig` | 🟢 (Read-only unitnya) | 🟢 (Read-only unitnya) | ❌ (DIBLOKIR) | ❌ (DIBLOKIR) | **FB-03 / FB-08:** Konfigurasi ritme adalah ranah operasional internal unit TK. |
| `updatePhaseActionMapping` | ❌ (DIBLOKIR) | 🟢 (Unitnya Sendiri) | ❌ (DIBLOKIR KERAS) | ❌ (DIBLOKIR) | **FB-08 (Keputusan 6A-1):** Hak eksklusif KS; Yayasan/Superadmin diblokir total. |
| `triggerClosureRitual` | 🟢 (Self-only) | ❌ (DIBLOKIR) | ❌ (DIBLOKIR) | ❌ (DIBLOKIR) | **H-07 / T-3 (Keputusan 6A-3):** Ritual penutup pribadi guru; non-aggregable lintas guru. |
| `getGuardianMoments` | ❌ (Internal) | ❌ (Internal) | ❌ (DIBLOKIR FB-01) | 🟢 (Hanya Anak Sendiri) | **FB-09 (Keputusan 6A-2):** Foto wajib memiliki tag anak bersangkutan. |
| `getGuardianDevelopment` | ❌ (Internal) | ❌ (Internal) | ❌ (DIBLOKIR FB-01) | 🟢 (Laporan Disahkan) | **Keputusan 6A-2 / 6A-8:** Hanya LPPA berstatus `APPROVED` yang diekspos; draf tertutup. |

*Keterangan: 🟢 Diizinkan dengan isolasi konteks penuh; ❌ Diblokir keras pada layer RLS dan Service Validator.*

---

## 2. KEPUTUSAN FORMAL ARSITEKTUR (KEPUTUSAN 6A-1 s.d. 6A-8)

### 2.1 Keputusan 6A-1: FB-08 School Rhythm Autonomy (Kedaulatan Ritme Unit)
* **Pernyataan Doktrin:** Kepala Sekolah adalah pemegang otoritas tunggal atas konfigurasi jadwal sirkadian dan pemetaan fase-ke-aksi pada unit TK yang dipimpinnya.
* **Batas Penegakan Teknis:**
  1. Penulisan ke tabel konfigurasi ritme (`school_rhythm_config`) dilindungi oleh RLS:
     $$\text{ALLOW\ UPDATE} \iff \text{auth.role} = \text{'HEADMASTER'} \land \text{auth.school\_id} = target.school\_id$$
  2. Yayasan (`FOUNDATION_DIRECTOR`, `YAPENDIK_SUPERADMIN`) dan peran lain **DILARANG SECARA ABSOLUT** memanggil mutasi konfigurasi ritme. Pelanggaran menghasilkan error `FORBIDDEN_RHYTHM_MUTATION`.

---

### 2.2 Keputusan 6A-2: FB-09 Guardian Data Minimization & Server-Derived Scope (Resolusi T-2)
* **Pernyataan Doktrin:** Akun Guardian tidak boleh diberi ruang untuk meminta identitas data siswa via parameter klien (*Zero Parameter Attack Surface*).
* **Batas Penegakan Teknis:**
  1. **Server-Derived Child Scope (T-2):** Endpoint `getBriefingData` dan `getGuardianMoments` **TIDAK MENERIMA** parameter `child_id` dari klien. Server mengekstraksi `auth.uid()` dan mencocokkannya ke tabel kanonikal `guardian_relationships`:
     $$\text{derived\_child\_ids} = \pi_{child\_id} (\sigma_{guardian\_id = auth.uid() \land status = 'ACTIVE'} (guardian\_relationships))$$
  2. **Proteksi Foto (FB-09):** Foto dokumentasi kegiatan hanya dikembalikan jika array `tagged_child_ids` pada baris momen memuat `child_id` anak dari wali bersangkutan.
  3. **Proteksi Laporan (D-6):** Wali murid hanya dapat melihat laporan LPPA yang telah berstatus `APPROVED` oleh Kepala Sekolah. Draf observasi guru yang sedang berjalan 100% terisolasi.

---

### 2.3 Keputusan 6A-3: H-07 Briefing Non-Surveillance & Closure Non-Aggregability (Resolusi T-3)
* **Pernyataan Doktrin:** Sistem briefing dan ritual penutup dirancang sebagai pendamping manusiawi, bukan instrumen pengawasan mikro (*anti-surveillance*) atau penilaian kinerja terselubung.
* **Batas Penegakan Teknis:**
  1. **Larangan Metrik Komparatif:** Service layer menolak query yang menghasilkan ranking, perbandingan persentil antar-guru, atau perbandingan kecepatan kerja.
  2. **Closure Non-Aggregability (T-3):** Data eksekusi `triggerClosureRitual` disimpan murni sebagai jejak personal perangkat guru. **DILARANG KERAS** membuat query atau dashboard agregasi multi-guru seperti *"Guru Tercepat Menutup Hari"* atau *"Tingkat Kerajinan Guru"*. Pelanggaran memicu `CROSS_TEACHER_CLOSURE_AGGREGATION_FORBIDDEN`.
  3. **Wajah Sisa Tenang Bebas Rasa Bersalah:** Jika masih ada tugas pending saat jam sekolah usai, status penutup diframing sebagai *Sisa Tenang* (`2 draf menemani Anda besok pagi`) dengan warna netral (`ink-soft`), dilarang menggunakan warna `danger`.

---

### 2.4 Keputusan 6A-4: Circadian Timezone Rule & Server Time Authority (Resolusi T-1)
* **Pernyataan Doktrin:** Indonesia terbentang di 3 zona waktu (WIB, WITA, WIT). Ritme sirkadian wajib berakar pada **zona waktu fisik sekolah**, bukan zona waktu perangkat pengguna.
* **Batas Penegakan Teknis:**
  1. Entitas `SchoolRhythmConfig` wajib memiliki properti `school_timezone: 'WIB' | 'WITA' | 'WIT'`.
  2. Evaluasi fungsi `evaluateBriefingMode` dihitung di server menggunakan `school_timezone` bersangkutan sebagai *Single Source of Truth*.
  3. **Toleransi Skew Klien:** Jika jam pada perangkat pengguna dimanipulasi atau berbeda dengan waktu server, mesin server tetap memaksakan mode briefing berdasarkan waktu riil di zona sekolah.

```typescript
export interface SchoolTimezoneResolution {
  school_timezone: 'WIB' | 'WITA' | 'WIT';
  server_utc_now: string;
  school_local_time: string; // Format "HH:mm"
}

export function resolveSchoolLocalTime(
  serverUtc: Date,
  timezone: 'WIB' | 'WITA' | 'WIT'
): string {
  const offsetHours = timezone === 'WIT' ? 9 : timezone === 'WITA' ? 8 : 7;
  const localDate = new Date(serverUtc.getTime() + offsetHours * 3600 * 1000);
  const hours = String(localDate.getUTCHours()).padStart(2, '0');
  const minutes = String(localDate.getUTCMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}
```

---

### 2.5 Keputusan 6A-5: Rhythm Vocabulary Versioning & Fail-Safe Defaulting (Resolusi T-4)
* **Pernyataan Doktrin:** Kosakata fase ritme kanonikal dibekukan dalam versi yang stabil agar ekstensi di masa depan tidak memecah konfigurasi sekolah yang telah berjalan.
* **Batas Penegakan Teknis:**
  1. Ditetapkan konstanta versi kanonikal: `RHYTHM_VOCABULARY_VERSION = 'v1'`.
  2. Katalog fase kanonikal v1 terdiri dari: `WELCOME` (*Sambut Ananda*), `CENTRA` (*Main Sentra*), `LUNCH` (*Makan Bekal*), `SYNTHESIS` (*Sintesis & Refleksi*), `HANDOVER` (*Serah Terima Ananda*), `CLOSING` (*Tutup Hari*).
  3. **Fail-Safe Defaulting:** Jika `phase_id` tidak dikenali oleh sistem atau terjadi kegagalan pembacaan jadwal lokal, mesin briefing secara otomatis jatuh ke bawaan konservatif (*Graceful Degradation*), memastikan header workspace tidak pernah mengalami *crash*.

---

### 2.6 Keputusan 6A-6: Doktrin Suara 432Hz: Earned & Intentional Only (D-7)
* **Pernyataan Doktrin:** Nada harmonis 432Hz adalah hadiah atas ketuntasan atau pilihan sadar pendidik, bukan polusi audio otomatis.
* **Batas Penegakan Teknis:**
  1. Suara hanya boleh dipicu melalui event `TASK_COMPLETION_EARNED` (saat tugas terakhir tuntas di dalam sesi) atau `USER_TAP_INTENTIONAL` (saat tombol `[Tutup Hari]` diketuk).
  2. Dilarang memutar suara pada saat inisialisasi aplikasi (*Cold Open*), navigasi halaman, atau perubahan rute.
  3. Mengandalkan kebijakan bawaan browser Web Audio API yang mewajibkan interaksi fisik (*User Gesture Context*) sebagai lapisan penegakan alami.
  4. Preferensi default aktif (`sound_closure_enabled: true`) dengan toggle mandiri pada menu setelan lokal.

---

### 2.7 Keputusan 6A-7: Hak untuk Istirahat & Penahanan Pesan Sirkadian (D-8)
* **Pernyataan Doktrin:** Pendidik berhak atas waktu istirahat malam tanpa interupsi beban kerja non-darurat.
* **Batas Penegakan Teknis:**
  1. Semua pesan non-keselamatan dan notifikasi tugas yang masuk setelah `school_closing_time` secara otomatis dialihkan ke status `HOLD_UNTIL_MORNING` dan disajikan pada mode `PRATINJAU` esok hari.
  2. **Bypass Keselamatan Mutlak:** Notifikasi keselamatan berkategori kritis (misal: darurat medis anak, kecelakaan) melewati lapisan `z-80 critical shield` dan langsung ditransmisikan tanpa terhalang mode penutup.

---

### 2.8 Keputusan 6A-8: Kamus Keluarga & Sanitasi Antarmuka Guardian
* **Pernyataan Doktrin:** Bahasa untuk orang tua adalah bahasa kasih dan pertumbuhan, bukan istilah birokrasi asesmen guru.
* **Batas Penegakan Teknis:**
  1. Istilah internal ditransformasikan secara deterministik:
     - `LPPA` $\longrightarrow$ *"Potret Perkembangan Ananda"*
     - `CP / Capaian Pembelajaran` $\longrightarrow$ *"Fokus Pengalaman Bermain"*
     - `Formative Assessment Record` $\longrightarrow$ *"Catatan Momen Hari Ini"*
  2. **Larangan Kuantitatif:** Permukaan Guardian DILARANG memuat angka skor, persentil, grafik radar perbandingan usia, atau peringkat kelas.

---

## 3. PERMUKAAN API / RPC TERLARANG (FORBIDDEN SURFACE)

Tabel berikut mendokumentasikan larangan mutlak (*hard block*) untuk mencegah pencemaran batas otoritas dan kebocoran privasi:

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        FORBIDDEN SURFACE MATRIX STAGE 6-A                              │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ ❌ TERLARANG UNTUK YAYASAN (FOUNDATION):                                              │
│   • rpc_update_phase_action_mapping (Melanggar FB-08 & FB-03)                          │
│   • rpc_get_school_rhythm_config (Melanggar FB-03)                                     │
│   • rpc_trigger_closure_ritual (Melanggar H-07)                                        │
│   • Akses data individu guru/siswa non-agregat (Melanggar FB-01)                       │
│                                                                                        │
│ ❌ TERLARANG UNTUK GUARDIAN (WALI MURID):                                              │
│   • Pengiriman parameter child_id pada RPC publik (Melanggar T-2)                      │
│   • Akses laporan perkembangan berstatus DRAF (Melanggar D-6)                          │
│   • Akses foto momen tanpa tag anak sendiri (Melanggar FB-09)                          │
│   • Akses catatan rekonsiliasi internal sekolah                                        │
│                                                                                        │
│ ❌ TERLARANG UNTUK NON-GURU (KS / YAYASAN / GUARDIAN):                                 │
│   • rpc_trigger_closure_ritual (Ritual penutup adalah hak eksklusif personal guru)     │
│                                                                                        │
│ ❌ TERLARANG UNTUK SERVICE LAYER & QUERY BUILDER:                                      │
│   • Injeksi kolom rank, percentile, speed_metric ke BriefingData (Melanggar H-07)      │
│   • Pembuatan query agregasi lintas-guru terhadap log penutup hari (Melanggar T-3)     │
│   • Pemutaran audio 432Hz tanpa context gesture atau saat perpindahan rute (D-7)       │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. SPESIFIKASI TEST SUITE ADVERSARIAL (SUITES 26 s.d. 28)

Untuk memastikan penegakan aturan tidak hanya berada di atas kertas, tiga suite pengujian adversarial dirancang untuk Gate 1:

### 4.1 Suite 26: FB-08 School Rhythm Autonomy Enforcement
* **Target Invarian:** FB-08 (Kedaulatan Ritme Unit Sekolah).
* **Test Cases:**
  1. **Case 26.1 (Cross-School KS Mutation Attack):** Login sebagai KS TK Menteng, panggil `updatePhaseActionMapping` dengan `school_id = 'tk_rawamangun'`.
     - *Assert:* Exception dilempar, mengembalikan `FORBIDDEN_RHYTHM_MUTATION`.
  2. **Case 26.2 (Foundation Override Attack):** Login sebagai `FOUNDATION_DIRECTOR`, panggil `updatePhaseActionMapping` untuk unit TK apa pun.
     - *Assert:* Ditolak pada layer otorisasi dengan error `FORBIDDEN_RHYTHM_MUTATION`.
  3. **Case 26.3 (Teacher Self-Config Mutation Attack):** Login sebagai `TEACHER`, panggil `updatePhaseActionMapping`.
     - *Assert:* Ditolak dengan error `UNAUTHORIZED_ROLE`.

---

### 4.2 Suite 27: FB-09 Guardian Data Minimization & Parameter Tampering
* **Target Invarian:** FB-09 & Resolusi T-2 (Minimasi Data Wali).
* **Test Cases:**
  1. **Case 27.1 (Parameter Tampering Attack):** Guardian A memodifikasi payload HTTP request untuk menyisipkan `child_id = 'child_of_guardian_b'`.
     - *Assert:* Server mengabaikan parameter klien dan menurunkan scope murni dari token sesi `auth.uid()`. Data anak B tidak bocor (`GUARDIAN_DATA_LEAK_BLOCKED`).
  2. **Case 27.2 (Untagged Photo Leaking):** Guardian A meminta feed momen; dalam database terdapat foto momen kelas tanpa tag `child_a`.
     - *Assert:* SQL RLS memfilter baris tersebut; foto tidak muncul di response payload.
  3. **Case 27.3 (Draft LPPA Snooping):** Guardian A mencoba mengakses dokumen LPPA yang masih berstatus `DRAFT_TEACHER`.
     - *Assert:* Query mengembalikan `404 / REPORT_NOT_PUBLISHED`.

---

### 4.3 Suite 28: H-07 Non-Surveillance, Circadian Skew, & Audio Integrity
* **Target Invarian:** H-07, D-7, D-8, T-1, T-3.
* **Test Cases:**
  1. **Case 28.1 (Surveillance Injection Attack):** Unit test menyuntikkan properti metrik ranking `{ teacher_rank: 1, class_completion_pct: 98 }` ke dalam builder `BriefingEngine`.
     - *Assert:* Schema validator melempar error `SURVEILLANCE_METRIC_REJECTED`.
  2. **Case 28.2 (Closure Metric Aggregation Attack):** Service mencoba mengeksekusi query `SELECT teacher_id, COUNT(*) FROM closure_logs GROUP BY teacher_id`.
     - *Assert:* Query diblokir pada layer kontrak dengan error `CROSS_TEACHER_CLOSURE_AGGREGATION_FORBIDDEN`.
  3. **Case 28.3 (Client Clock Tampering Simulation):** Klien menyetel jam sistem ke pukul 23:00 (malam), namun waktu sekolah aktual di server masih pukul 09:00 WIB.
     - *Assert:* Mode briefing tetap dievaluasi sebagai `OPERASIONAL` (Server Time Authority).
  4. **Case 28.4 (Ambient Sound Trigger Attack):** Memanggil sintesis 432Hz pada event `ROUTE_CHANGE` atau tanpa user gesture.
     - *Assert:* Validator `canPlay432HzSound` mengembalikan `false` (`AUDIO_GESTURE_MISSING_PROHIBITED`).

---

## 5. SERTIFIKASI KESIAPAN IMPLEMENTASI (GATE 0.1 DECLARATION)

```text
╔══════════════════════════════════════════════════════════════════════════════╗
║            STAGE 6-A — GATE 0.1 SEMANTIC & BOUNDARY CLOSURE CERTIFICATE       ║
║                                                                              ║
║  GATE 0 (CONTRACT HARDENING)          : RATIFIED BY ARB                      ║
║  GATE 0.1 (SEMANTIC & BOUNDARY)       : SEALED & LOCKED                      ║
║  TIGHTENING NOTES RESOLVED            : T-1 (Timezone), T-2 (Child Scope),   ║
║                                         T-3 (Non-Aggregable), T-4 (Vocab v1) ║
║  INVARIANTS ACTIVE                    : FB-08, FB-09, H-07                   ║
║  ADVERSARIAL SUITES SPECIFIED         : Suites 26, 27, 28                    ║
║  FROZEN CORE PROTECTION               : 15 Canonical Tables Untouched        ║
║                                                                              ║
║  OVERALL READINESS                    : 🟢 GO FOR GATE 1 TECHNICAL DESIGN     ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

*Dokumen ini merupakan ketetapan tata kelola final (Gate 0.1). Dengan penyegelan dokumen ini, perancangan teknis skema database, RLS policies, service engine, dan glass layer UI pada **Gate 1** resmi diizinkan untuk dimulai.*
