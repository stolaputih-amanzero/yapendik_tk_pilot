# STAGE 6-A ARCHITECTURAL INTENT
## "The Warm Briefing" — Context-Aware Operating Companion
### Design Brief & Architectural Intent Document (v1.1-DRAFT)

**META**

| Atribut | Nilai |
| --- | --- |
| Document ID | `DOC-AMANAURA-STAGE-6A-BRIEFING-INTENT-v1.1` |
| Version | `1.1-DRAFT` (Incorporating Amendment #1 `DOC-AMANAURA-STAGE-6A-AMEND-01`) |
| Governing Tier | `LEVEL 2 — STAGE 6 STRATEGIC GROWTH DOMAIN` |
| Status | `DESIGN BRIEF — PENDING GATE 0` |
| Draft Date | `2026-08-30` |
| Authoritative Standard | Derived from YAPENDIK OPERATING SYSTEM CONSTITUTION v0.2 |
| Prerequisite Stages | Stage 4.5 LEARN (SEALED) + v4.0 Crystal Sovereign (SEALED) |
| Target Scope | Context-Aware Briefing System untuk 4 Peran + Circadian Closure Mode |

---

## 1. EXECUTIVE SUMMARY

### 1.1 The Problem: "The Cold Database Syndrome"

Aplikasi Yapendik School OS saat ini menderita tiga gejala fundamental yang membuat pengguna merasa "melelahkan" dan "membosankan":

1. **Zero Contextual Greeting (Cold Open):** Aplikasi membuka seperti "database viewer" — logo + avatar + status DB. Tidak ada sapaan personal berbasis waktu + role + konteks hari ini.
2. **Information Overload (No Progressive Disclosure):** Semua widget ditampilkan sekaligus dengan "volume" yang sama. Pengguna harus "berburu" informasi, bukan "dipandu" ke informasi yang relevan.
3. **Cognitive Fatigue (No Rhythm):** Flat list of data dengan visual hierarchy yang lemah. Pengguna merasa seperti "operator data entry", bukan "pendidik yang dibantu sistem cerdas".

### 1.2 The Vision: "The 5-Second Rule"

Dalam 5 detik pertama membuka aplikasi, pengguna harus tahu:
1. **Siapa saya** (role-aware greeting)
2. **Apa yang penting HARI INI** (context-aware summary)
3. **Apa yang harus saya lakukan SEKARANG** (action-aware CTA)

Jika tidak, aplikasi **gagal**.

### 1.3 The Solution: 4 Briefing Machines, 1 Shell + The Closure Mode

Setiap peran memiliki "mesin" briefing yang berbeda:

| Peran | Mesin | Inti Briefing |
| --- | --- | --- |
| **Guru** | Ritme (jam sekolah) | Fase aktif + aksi lokal + yang tertunda |
| **Kepala Sekolah** | Otoritas (antrean tanda tangan) | Rekonsiliasi + antrean otoritas + kemitraan |
| **Yayasan** | Siklus (penutupan loop) | Antrean keputusan + loop terbuka + sinyal equity |
| **Guardian** | Ikatan (kabar anak) | Hari ini + momen + perkembangan |

Empat mesin, satu `<BriefingShell>`. Dan tak satu pun dari mereka dashboard: masing-masing **satu kalimat + satu aksi + satu gema**, beroperasi dalam siklus sirkadian sapaan pagi hingga ritual penutup hari.

---

## 2. ARCHITECTURAL PRINCIPLES

### 2.1 Three Layers of Otonomi (Ritme Kelas)

Konfigurasi ritme kelas dibagi menjadi tiga lapis otonomi:

1. **Kosakata fase** — kanonikal (penyambutan, sentra, makan bekal, serah terima, sintesis, penutup). Sistem memahami katalog fase umum TK.
2. **Jadwal fase** — lokal per sekolah (sudah ada sebagai *Local Schedule*, Gate 0.1 Keputusan 7). Fase mana yang aktif, urutannya, jam berapa: hak mutlak Kepala Sekolah.
3. **Pasangan fase→aksi** — lokal per sekolah dengan bawaan kanonikal. Kepala Sekolah mengkonfigurasi override via SelectSheet (5–15 aksi kanonikal + opsi "Tanpa aksi cepat" + tombol "Tetapkan Bawaan").

**Keputusan (D-1, D-2):** Override per kelas ditangguhkan ke v2 bila ada bukti kebutuhan nyata. v1 hanya mendukung konfigurasi tingkat sekolah oleh Kepala Sekolah.

### 2.2 Mechanism: Briefing as Workspace Header, Not Separate Page

**Bukan halaman gerbang terpisah** — briefing menggantikan header generik di workspace masing-masing (D-3).

**Struktur:**
```tsx
<BriefingShell>           // Shared: sapaan waktu, tanggal, avatar, mode sirkadian
  <TeacherBriefing />     // Khusus guru: fase aktif, pending, CTA, closure
  <HeadmasterBriefing />  // Khusus KS: adopsi, rekonsiliasi, alert, closure
  <FoundationBriefing />  // Khusus yayasan: insight, action ledger, closure
  <GuardianBriefing />    // Khusus ortu: kabar anak hari ini, surat sore
</BriefingShell>
```

Setiap anak komponen hidup di dalam workspace perannya masing-masing — bukan di route terpisah, bukan di halaman gerbang. Ia *adalah* header workspace-nya.

### 2.3 Universal Rules

* **Satu kalimat + satu aksi + satu gema** per peran.
* **Circadian State Machine** — briefing beradaptasi secara mulus antara Pratinjau, Operasional, dan Penutup.
* **CTA Dominance saat jam kerja, Ghost/Mundur saat jam istirahat** — menghormati batas sirkadian pendidik.
* **Fail-safe defaulting** — konfigurasi jadwal/predikat hilang → jatuh ke bawaan kanonikal yang konservatif; sistem tidak pernah pecah.

---

## 3. DETAILED BRIEFING SPECIFICATIONS

### 3.1 Guru — "Ritme Mesin"

**Contoh kalimat briefing:**
*"Selamat pagi, Bu Siti — sekarang waktu Main Sentra. [Rekam Momen Sentra] • 3 draf observasi belum selesai."*

**Aturan CTA tunggal (deterministik):**
* Jika ada alert keselamatan (alergi/suhu abnormal) → CTA = "Lihat Peringatan"
* Jika ada fase aktif → CTA = aksi pasangan fase
* Jika ada pending tasks → CTA = tugas tertua
* Jika semua lengkap → CTA = "Ringkasan Hari Ini"

**Gema hangat:** Dirender menggunakan komponen kanonikal `WarmEchoCarousel` (commit `f1f18fd`) yang tampil terbuka penuh sepanjang hari — menyajikan 5 kutipan apresiasi orang tua (Buku Penghubung) dengan tanda kutip emas `“`, avatar inisial anak, navigasi geser lembut, dan animasi reaksi kasih (*Heart Pop*). Dilarang keras dilipat atau disembunyikan.

### 3.2 Kepala Sekolah — "Otoritas Mesin"

**Contoh kalimat briefing:**
*"Selamat pagi, Pak Andreas. 2/3 kelas lengkap • 2 draf LPPA menunggu pengesahan • 1 direktif perlu respons. [Tinjau Antrean]"*

**Tiga hal terpenting:**
1. **Rekonsiliasi pagi** — kehadiran lintas kelas + alert keselamatan aktif.
2. **Antrean otoritas** — hal yang hanya KS yang bisa menggerakkan: draf LPPA menunggu pengesahan, direktif Yayasan menunggu respons adopsi (dengan usia tunggu), eskalasi guru.
3. **Denyut kemitraan** — pesan ortu belum dibalas + konfirmasi yang menggantung.

**Aturan CTA tunggal:** alert keselamatan > antrean otoritas > kemitraan — tombol membawa ke item paling urgen.

**Gema hangat:** Satu kalimat terima kasih ortu dari Buku Penghubung, atau refleksi kualitatif guru — sisi manusiawi dari sekolah yang ia pimpin.

**Kepatuhan FB-03:** Briefing menampilkan *otoritas KS*, bukan pengawasan terhadap guru.

### 3.3 Yayasan — "Siklus Mesin"

**Contoh kalimat briefing:**
*"Selamat pagi, Bu Ketua. 2 insight menunggu keputusan Dewan • 1 aksi belum tertutup • 1 pola baru. [Telaah Insight]"*

**Tiga hal terpenting:**
1. **Antrean keputusan Dewan** — insight berstatus REVIEWED menunggu ACCEPTED/DISMISSED beserta rationale (H-04).
2. **Kesehatan loop** — aksi yang belum tertutup FB-05: menunggu respons adopsi sekolah, atau outcome belum terekam.
3. **Sinyal equity & keselamatan** — pola baru terdeteksi; kohor kecil tampil sebagai perisai privasi, bukan angka.

**Aturan CTA tunggal:** keputusan menunggu > loop terbuka > pola baru.

**Gema hangat:** Kutipan `human_reflective_interpretation` dari ObservedOutcomeEffect — suara manusia Kepala Sekolah kepada Dewan (H-02). Stewardship yang ditutup dengan suara, bukan angka.

**Kepatuhan FB-04/FB-07:** Sinyal berorientasi equity, tak pernah ranking; kohor kecil tetap perisai.

### 3.4 Guardian — "Ikatan Mesin"

**Contoh kalimat briefing:**
*"Selamat pagi, Bunda Kenzo. Kenzo hadir hari ini • makan siang habis • bermain di sentra balok. [Lihat Momen Terbaru]"*

**Workspace kecil 3 tab (D-4):**
1. **Hari Ini** — briefing itu sendiri: *"Kenzo hadir • makan siang habis • hari ini di sentra balok"* + satu momen hangat + catatan guru bila ada.
2. **Momen & Karya** — kedalaman harian: galeri momen dan karya anak.
3. **Perkembangan** — kedalaman panjang: narasi per semester, linimasa tumbuh kembang, galeri karya akumulatif.

**Keputusan privasi & pengalaman (D-5, D-6):**
* **Foto hanya yang bertanda:** Hanya foto tempat anaknya bertanda (via selector existing). Guru tidak menambah langkah baru; penandaan anak pada momen = keluarga yang boleh melihatnya.
* **Ringkasan ramah ortu:** Komposisi dari medan existing (pesan untuk keluarga + 2–3 momen bertanda + chip domain berbahasa keluarga) — tanpa beban tulis baru untuk guru.
* **Laporan utuh satu ketukan:** Narasi LPPA lengkap dengan suara guru, versi yang sudah disahkan Kepala Sekolah. Orang tua hanya melihat versi *disahkan*; draf guru tidak pernah bocor.

**Larangan mutlak:** Tanpa skor, tanpa peringkat, tanpa perbandingan. Kamus Keluarga (bukan Kamus Pendidik).

---

## 3.5 THE CLOSURE MODE — RITUAL PENUTUP HARI & CIRCADIAN BRIEFING STATE MACHINE (AMENDMENT #1)

### 3.5.1 Executive Intent

Jika pembuka berkata *"inilah yang penting hari ini"*, maka penutup wajib berkata *"cukup untuk hari ini — Anda sudah melakukannya dengan baik."* Tanpa penutup, aplikasi terasa seperti shift yang tidak pernah usai. Closure Mode adalah pemenuhan harfiah **Gate 0.1 Keputusan 6** (*"OS Menghilang ke Dalam Hari Guru"*) dan pasangan sirkadian dari **Signature #6 Circadian Daylight** + **Invisible Mastery #6** (*Emotional Affirmation & 432Hz*).

### 3.5.2 Briefing Mode State Machine

Mesin briefing beroperasi dalam tiga mode, digerakkan oleh **Local Schedule sekolah (FB-03)** + predikat ketuntasan — bukan jam dinding semata:

| Mode | Trigger | Kalimat Pembuka |
| --- | --- | --- |
| **PRATINJAU** | Sebelum fase pertama (pagi buta / Senin pagi) | *"Hari ini dimulai 06:45 — 3 hal menanti Anda."* |
| **OPERASIONAL** | Di dalam jendela fase sekolah | *"Sekarang waktu Main Sentra — [Rekam Momen]."* |
| **PENUTUP** | Setelah fase terakhir | *"Hari ini selesai, Bu Siti."* |

**PENUTUP memiliki dua wajah emosional, keduanya wajib tenang:**
* **Tuntas:** Seluruh predikat hijau → afirmasi + gema hangat.
* **Sisa Tenang:** Ada yang belum selesai → *"2 draf menemani Anda besok pagi."* Nada netral; **tidak pernah** warna danger.

### 3.5.3 Anatomi Briefing Penutup

Aturan *"satu kalimat + satu aksi + satu gema"* tetap, dengan register tenang:

* **Kalimat** + micro-summary chips: `15/15 hadir • 3 momen • 2 pesan terbalas`.
* **Gema:** Satu suara hangat dari data hari itu (kalimat anak, terima kasih Bunda, refleksi guru untuk KS).
* **Aksi:** `[ Tutup Hari ]` bergaya **ghost** — biru primer mundur di malam hari; *CTA Dominance adalah hukum jam kerja, bukan hukum jam istirahat.*
* **Visual:** Amanaura Breath ✦ melambat **4s → 8s** sebagai sinyal "sistem ikut beristirahat"; `ink-soft` mendominasi. Konstanta fisika Amanaura Spring **tidak berubah** — yang sirkadian adalah napas, bukan pegas.

### 3.5.4 Doktrin Suara 432Hz (D-7): *Earned or Intentional, Never Ambient*

* **Earned:** Denting berbunyi tepat saat tugas terakhir hari itu tuntas di dalam aplikasi (gesture context ada — sah secara Web Audio dan emosional).
* **Intentional:** Malam hari, ketukan `[ Tutup Hari ]` memutar ulang denting dengan konsen eksplisit.
* **Tidak pernah** berbunyi saat aplikasi dibuka, saat navigasi, atau otomatis di malam hari.
* **Default ON dengan toggle** "Suara Penutup Hari" (preferensi lokal perangkat, setingkat `useTheme`); menghormati mode senyap perangkat.
* **Spesifikasi:** Sine 432Hz, attack ≈ 0.05s, release ≈ 1.5s, gain rendah; dibangkitkan WebAudio oscillator (tanpa aset eksternal). Kebijakan platform Web Audio (wajib user gesture) secara teknis **menegakkan** doktrin ini.

### 3.5.5 Hak untuk Istirahat (D-8)

* Mode PENUTUP **tidak pernah menugaskan kerja baru**.
* Pesan non-keselamatan yang masuk setelah jam sekolah **menunggu PRATINJAU pagi** — tidak menembus penutup.
* Pengecualian hanya **keselamatan kritis**, lewat jalurnya sendiri (lapis `z-80 critical shield`), **bukan** lewat briefing.
* **Tanpa rasa bersalah:** Sisa kerja diframing "menunggu besok"; warna danger tetap hak eksklusif keselamatan.

### 3.5.6 Ritme Penutup per Peran

| Peran | Ritme Closure |
| --- | --- |
| **Guru** | Harian (paling kuat) |
| **Kepala Sekolah** | Harian manajerial ("2 LPPA disahkan • 1 direktif direspons" + gema refleksi guru) |
| **Yayasan** | **Mingguan** — refleksi Jumat sore, pratinjau Senin pagi (siklus Dewan ≠ hari sekolah) |
| **Guardian** | Closure-shaped by nature — "surat sore" tentang hari anak adalah pengalaman utama mereka |

### 3.5.7 Amandemen Kamus Pendidik (D-9)

Kategori baru **"Kamus Ritual"** (terpisah dari Kamus Kata Kerja Baku, karena nama ritual bukan verba CRUD):
* `Sambut Ananda` (existing, fase ritme) ↔ `Tutup Hari` (baru, ritual penutup).

---

## 4. TECHNICAL ARCHITECTURE (PRELIMINARY)

### 4.1 Why This Is Stage 6 (Not UI Sweep)

| Aspek | UI/UX Sweep (v4.0 Crystal Sovereign) | The Warm Briefing (Stage 6-A) |
| --- | --- | --- |
| **Skema database** | Tidak berubah | Baru: `school_rhythm_config`, `phase_action_mapping` |
| **RLS policies** | Tidak berubah | Baru: school-writes-own untuk konfigurasi ritme |
| **RPC endpoints** | Tidak berubah | Baru: `getBriefingData`, `updatePhaseActionMapping` |
| **Service layer** | Tidak berubah | Baru: `BriefingEngine` (komposisi per peran & state machine sirkadian) |
| **Komponen UI** | Refactor existing | Baru: `BriefingShell` + 4 anak komponen + audio generator |
| **Protokol** | UI/UX-Only Protocol (§9.3) | **Stage Gate Process** (Gate 0 → 0.1 → 1) |

### 4.2 Proposed Invarian

**FB-08: School Rhythm Autonomy**
* Kepala Sekolah memiliki hak eksklusif mengkonfigurasi pasangan fase→aksi untuk unitnya.
* RLS: `UPDATE school_rhythm_config WHERE school_id = auth.school_id()`.
* Yayasan/Superadmin DIBLOKIR dari mutasi konfigurasi ritme sekolah lain.

**FB-09: Guardian Data Minimization**
* Guardian hanya melihat data anaknya sendiri + foto bertanda.
* RLS: `SELECT FROM moments WHERE child_id IN (SELECT child_id FROM parent_child_link WHERE parent_id = auth.uid())`.
* Foto tanpa tanda anak = tidak muncul di Guardian view.

**H-07: Briefing Non-Surveillance**
* Briefing tidak boleh menampilkan metrik perbandingan antar-guru atau antar-siswa.
* Ringkasan penutup adalah hari *milik sendiri* — nol perbandingan.
* Service layer validation: `validateNoComparativeMetrics()` menolak query yang mengandung `rank`, `percentile`, `comparison`.

### 4.3 Proposed Entity Model (Preview)

```typescript
export type BriefingMode = 'PREVIEW' | 'OPERATIONAL' | 'CLOSURE';
export type ClosureState = 'COMPLETE' | 'SERENE_REMAINDER';

// 1. SCHOOL RHYTHM CONFIG (Konfigurasi tingkat sekolah)
export interface SchoolRhythmConfig {
  config_id: string;
  school_id: string;
  academic_year_id: string;
  phases: PhaseConfig[];
  updated_by_person_id: string; // Kepala Sekolah
  updated_at: string;
}

export interface PhaseConfig {
  phase_id: string; // Kanonikal: 'WELCOME', 'CENTRA', 'LUNCH', 'CLOSING', etc.
  phase_name: string;
  start_time: string; // "07:15"
  end_time: string;   // "08:30"
  is_active: boolean;
  quick_action_id?: string; // Pasangan fase→aksi (override lokal)
}

// 2. PHASE ACTION MAPPING (Katalog aksi kanonikal)
export interface PhaseActionMapping {
  action_id: string;
  action_name: string; // "Rekam Momen", "Buka Presensi", "Tutup Hari", etc.
  action_type: 'NAVIGATION' | 'MODAL' | 'SHEET' | 'RITUAL';
  target_route?: string;
  target_component?: string;
  is_default: boolean; // Bawaan kanonikal
}

// 3. BRIEFING BASE DATA
export interface BaseBriefingData {
  mode: BriefingMode;
  closure_state?: ClosureState;
  greeting: string;
  date: string;
  warm_echo?: string;
}

// 4. ROLE-SPECIFIC BRIEFING DATA
export interface TeacherBriefingData extends BaseBriefingData {
  active_phase?: PhaseConfig;
  quick_action?: PhaseActionMapping;
  pending_tasks: {
    attendance_incomplete: boolean;
    active_allergies: number;
    unread_messages: number;
    draft_observations: number;
  };
  closure_summary?: {
    present_children: number;
    total_children: number;
    moments_recorded: number;
    messages_replied: number;
    pending_drafts_count: number;
  };
}

export interface HeadmasterBriefingData extends BaseBriefingData {
  reconciliation: {
    classes_complete: number;
    classes_total: number;
    safety_alerts: number;
  };
  authority_queue: {
    pending_lppa_approvals: number;
    pending_adoptions: number;
    oldest_pending_age_days: number;
  };
  partnership_pulse: {
    unread_messages: number;
    pending_confirmations: number;
  };
  closure_summary?: {
    lppa_approved_today: number;
    directives_responded_today: number;
    safety_status_green: boolean;
  };
}

export interface FoundationBriefingData extends BaseBriefingData {
  decision_queue: {
    insights_awaiting_decision: number;
    oldest_insight_age_days: number;
  };
  loop_health: {
    actions_awaiting_adoption: number;
    outcomes_not_recorded: number;
  };
  equity_signals: {
    new_patterns_detected: number;
    suppressed_cohorts: number;
  };
  cycle_view: 'DAILY_ALERT' | 'WEEKLY_REVIEW' | 'WEEKLY_PREVIEW';
}

export interface GuardianBriefingData extends BaseBriefingData {
  child_name: string;
  today_summary: {
    attendance_status: 'Hadir' | 'Izin' | 'Sakit' | 'Alpa';
    meal_status?: string;
    active_phase?: string;
  };
  latest_moment?: {
    moment_id: string;
    thumbnail_url: string;
    caption: string;
  };
  teacher_note?: string;
}
```

---

## 5. STAGE 4.5 COMPLIANCE CONSIDERATIONS

### 5.1 Invarian yang Wajib Dipertahankan

* **FB-01 (Zero Individual Exposure):** Briefing Yayasan tidak boleh membocorkan nama anak, NIK, NIS, atau foto individual.
* **FB-03 (Autonomous Unit Leadership):** Konfigurasi ritme & jadwal lokal adalah hak KS; Yayasan tidak boleh override.
* **FB-04 (No Cross-School Ranking):** Briefing Yayasan tidak boleh menampilkan leaderboard atau perankingan.
* **FB-07 (K-Anonymity):** Kohor kecil (< 5) wajib disupresi di briefing Yayasan.
* **H-02 (Strict Non-Causal):** Briefing tidak boleh mengklaim kausalitas ("Kebijakan X menyebabkan kenaikan Y").
* **H-04 (Audited Decision Records):** Insight yang ditampilkan di briefing Yayasan wajib memiliki `decision_id` jika sudah diputuskan.
* **H-07 (Briefing Non-Surveillance):** Ringkasan penutup adalah hari milik sendiri — nol perbandingan antar-guru/siswa.

### 5.2 Komponen Glass Layer yang Terlibat

* `<PrivacyShield />` — untuk data agregat Yayasan yang disupresi.
* `<NonCausalDelta />` — untuk catatan kaki etis pada insight.
* `<CanonicalAnchor />` — untuk `action_id` di briefing Yayasan.

---

## 6. PROPOSED GATE PROCESS

Ketika Project Owner siap memulai implementasi, proses berikut akan dijalankan:

### Gate 0: Contract Hardening
* Mengunci entitas domain (`SchoolRhythmConfig`, `PhaseActionMapping`, `BriefingData`, `BriefingMode`, `ClosureState`).
* Mengunci query composition rules & state machine sirkadian (Pratinjau, Operasional, Penutup).
* Mengunci API contracts (`getBriefingData` per role, `triggerClosureRitual`).

### Gate 0.1: Semantic & Boundary Closure
* Mengunci batas otoritas (**FB-08: School Rhythm Autonomy**).
* Mengunci invarian privasi (**FB-09: Guardian Data Minimization**).
* Mengunci semantik non-surveilans & non-guilt (**H-07: Briefing Non-Surveillance**).
* Mengunci protokol audio 432Hz (Earned/Intentional, web-audio user gesture constraint).

### Gate 1: Technical Architecture & Enforcement Design
* Skema database baru + RLS policies (`school_rhythm_config`, `phase_action_mapping`).
* Service layer (`BriefingEngine`, Web Audio synthesis 432Hz oscillator).
* Adversarial test suites (FB-08, FB-09, H-07, State Machine transition tests).
* Komponen UI (`BriefingShell` + 4 sub-briefings + Ghost CTA + Amanaura Breath 8s night timing).

---

## 7. NEXT STEPS

Dokumen ini adalah **design brief v1.1** yang siap untuk review dan transisi ke Gate 0:

1. **Inisiasi Gate 0** untuk mengunci kontrak semantik dan skema domain.
2. **Lanjutkan ke Gate 0.1 dan Gate 1** sesuai proses standar Yapendik School OS.
3. **Implementasi** dengan Stage 4.5 FROZEN dan UI/UX-Only Protocol untuk lapisan presentasi.

---

## 8. APPENDIX: DECISION LOG

| # | Keputusan | Tanggal | Rationale |
| --- | --- | --- | --- |
| D-1 | Otonomi pasangan fase→aksi = lokal (terkekang) | 2026-08-30 | FB-03: keputusan operasional adalah hak KS |
| D-2 | Kedalaman otonomi = KS saja (override guru ditangguhkan) | 2026-08-30 | v1 simplicity; bukti kebutuhan nyata belum ada |
| D-3 | Briefing menggantikan header workspace (bukan halaman gerbang) | 2026-08-30 | Zero friction untuk guru yang buka 15x/hari |
| D-4 | Guardian workspace = kecil, 3 tab | 2026-08-30 | Ringkas sesuai kebutuhan; kedalaman on-demand |
| D-5 | Foto Guardian = hanya yang bertanda | 2026-08-30 | Privasi konservatif; zero UI baru |
| D-6 | Laporan Guardian = ringkasan + utuh satu ketukan | 2026-08-30 | Suara guru utuh; pintu masuk tidak mengintimidasi |
| D-7 | Suara 432Hz default ON dengan toggle; pemicu hanya earned/intentional | 2026-08-30 | Tidak pernah terasa spam; konsen eksplisit, patuh Web Audio user gesture |
| D-8 | Pesan non-keselamatan ditahan sampai PRATINJAU pagi; keselamatan via `z-80` | 2026-08-30 | Melindungi hak istirahat pendidik; keselamatan tetap punya jalur kritis |
| D-9 | `Tutup Hari` masuk Kamus Ritual, pasangan `Sambut Ananda` | 2026-08-30 | Simetri sirkadian pembuka–penutup hari kerja |

---

**Status:** Dokumen ini adalah **Architectural Intent v1.1** yang terkunci dan siap untuk pelaksanaan Gate 0. Tidak ada kode aplikasi yang akan ditulis sampai Gate 0 disahkan secara formal.
