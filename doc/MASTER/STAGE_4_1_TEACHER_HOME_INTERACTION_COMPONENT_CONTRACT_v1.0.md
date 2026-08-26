# Yapendik School OS — Stage 4.1 Teacher Home Interaction Component Contract v1.0
**Document ID:** `DOC-STAGE-4-1-COMPONENT-CONTRACT-v1.0`  
**Status:** `ACTIVE ARCHITECTURE SPECIFICATION — IMPLEMENTATION BOUND`  
**Date:** `2026-08-26`  
**Target Milestone:** `Domain 4.1 Unified Teacher Home Component Behavioral Contracts`  
**Parent Specifications:**  
- `DOC-STAGE-4-1-TEACHER-DAILY-OPERATING-MODEL-v1.0` (Operating Model)  
- `DOC-STAGE-4-1-INTERACTION-SPEC-v1.0` (Interaction Specification)  
- `DOC-STAGE-4-1-EXPERIENCE-ARCH-v1.0` (Experience Architecture)  
**Governance Substrate:** `Stage 3 Frozen Baseline (DOC-STAGE-3-CLOSURE-CERT-v1.0)`

---

## 1. Specification Charter & Contract Protocol

Dokumen ini mendefinisikan **kontrak perilaku komponen (Behavioral Component Contract)** untuk antarmuka *Teacher Home*. Setiap komponen tidak hanya didefinisikan secara visual, melainkan diikat oleh kontrak presisi yang mencakup batasan aksi yang diizinkan (*Allowed/Forbidden Actions*), keterikatan pada invarian tata kelola Stage 3, ketahanan luring (*Offline Resilience*), serta kriteria penerimaan (*Acceptance Criteria*).

```text
┌───────────────────────────────────────────────────────────────────────────────────┐
│                           CANONICAL COMPONENT CONTRACT SCHEMA                     │
├───────────────────────────────────────────────────────────────────────────────────┤
│  1. Purpose & Responsibilities          8. Command Invoked (Mutations)            │
│  2. Context Anchor                      9. Governance Boundary (Stage 3 Guards)   │
│  3. Entry Conditions                   10. Success & Feedback Response            │
│  4. User Intent                        11. Exception & Error Handling             │
│  5. Allowed Actions                    12. Offline & Low-Bandwidth Behavior       │
│  6. Forbidden Actions                  13. Accessibility & Tactility              │
│  7. Data Required (Props/Queries)      14. Acceptance Criteria (Verification Gate)│
└───────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Core Shell & Context Components

### CC-01: `TeacherHomeShell`
* **Purpose:** Komponen pembungkus utama yang mengunci konteks otentikasi guru, rombel aktif, dan mengoordinasikan *3-Tier Surface*.
* **Context Anchor:** `person_id` guru, `school_id`, `class_id` aktif, `academic_year_id`, `semester_id`, tanggal hari ini.
* **Entry Conditions:** Pengguna login dengan peran `TEACHER` atau `HEADMASTER` yang memiliki penugasan rombel sah.
* **Allowed Actions:** Berpindah antar 3 Tab Kanonikal (`Hari Ini`, `Belajar & Karya`, `Siswa & Rapor`); membuka Laci Pengayaan (*Enrichment Tray*); memicu *One Child Context Pivot*.
* **Forbidden Actions:** Memilih sekolah/tahun/semester lain di luar penugasan aktif (Zero dropdown ganda).
* **Governance Boundary:** Dilarang mengizinkan mutasi bila semester berstatus `CLOSED` (Menerapkan `trg_closed_period_guard`).
* **Acceptance Criteria (Verification Gates):**
  - [ ] Merender konteks kelas aktif dalam $< 300\text{ms}$ tanpa *flicker*.
  - [ ] Menjaga *Child Context Anchor* saat berpindah tab.

---

### CC-02: `ClassroomPulseBanner`
* **Purpose:** Menampilkan denyut kehadiran kelas saat ini dan mengekspos peringatan eksepsi kritis secara proaktif (*Tier 1 Pulse*).
* **Data Required:** `activeStudentCount`, `presentCount`, `unaccountedCount`, `healthAlerts[]`, `unreadParentNotesCount`.
* **Allowed Actions:** Klik banner eksepsi untuk langsung memfilter kartu anak yang bersangkutan.
* **Forbidden Actions:** Menampilkan grafik analitik kompleks atau KPI multi-tahun.
* **Acceptance Criteria (Verification Gates):**
  - [ ] Menghitung rasio kehadiran secara *real-time* (cth: "15/16 Hadir").
  - [ ] Menampilkan badge oranye jika ada catatan alergi atau titipan obat orang tua.

---

### CC-03: `OperatingStateIndicator`
* **Purpose:** Menunjukkan status fase pedagogis saat ini (cth: `WELCOME`, `PLAY & OBSERVE`, `SYNTHESIZE`) secara adaptif.
* **Allowed Actions:** Guru dapat secara sukarela beralih mode fokus bila ritme kelas berubah lebih awal.
* **Acceptance Criteria (Verification Gates):**
  - [ ] Bertindak sebagai panduan kontekstual tanpa mengunci paksa layar guru bila jam operasional bergeser.

---

## 3. Today & Attendance Components (Tab 1: Hari Ini)

### CC-04: `AttendanceGrid` & `ChildCard`
* **Purpose:** Instrumen presensi kedatangan satu-ketuk (*One-Tap Attendance*) yang ramah sentuhan.
* **Context Anchor:** Roster siswa rombel aktif pada tanggal hari ini.
* **User Intent:** "Menandai kehadiran ananda saat tiba di pintu kelas dalam waktu $< 2$ detik per anak."
* **Allowed Actions:**
  - Ketuk kartu: Toggle status (`HADIR` $\rightarrow$ `SAKIT` $\rightarrow$ `IZIN` $\rightarrow$ `ALPHA`).
  - *Long-Press / Quick Action Menu:* Input suhu tubuh (cth: 36.5°C) & catatan kondisi pagi ("agak pilek").
* **Forbidden Actions:** Mengubah presensi pada tanggal di semester yang telah `CLOSED`.
* **Command Invoked:** `recordDailyAttendanceBatchCommand(schoolId, classId, date, entries[])`.
* **Governance Boundary:** Mematuhi kendala keunikan deterministik `uq_daily_attendance_record`.
* **Success Response:** Taktil visual zamrud instan + pembaruan angka kehadiran di `ClassroomPulseBanner`.
* **Offline Behavior:** Tersimpan seketika di buffer lokal IndexedDB dan disinkronkan otomatis saat jaringan pulih.
* **Acceptance Criteria (Verification Gates):**
  - [ ] Presensi 16 anak dapat diselesaikan dalam waktu total $< 45$ detik.
  - [ ] Duplikasi pengiriman dari dua guru sekaligus digabungkan secara *idempotent* tanpa bentrok data.

---

### CC-05: `GuardianNoticeLedger`
* **Purpose:** Menampilkan linimasa komunikasi dua arah dengan orang tua murid (*Buku Penghubung*).
* **Allowed Actions:** Membaca pesan titipan orang tua; menandai pesan telah dibaca (*Acknowledge*); membalas pesan kepulangan.
* **Governance Boundary:** Terisolasi ketat oleh *C-11 Family Confidentiality*; orang tua hanya melihat notisi miliknya.
* **Command Invoked:** `acknowledgeGuardianNoticeCommand(noticeId, personId, replyText)`.
* **Acceptance Criteria (Verification Gates):**
  - [ ] Badge "Belum Dibaca" hilang seketika saat guru membuka pesan titipan obat.

---

## 4. Learning & Evidence Capture Components (Tab 2: Belajar & Karya)

### CC-06: `QuickCaptureFloatingButton` (`[⚡ Momen Cepat]`)
* **Purpose:** Primitif aksi melayang (*Floating Action Primitive*) untuk menangkap momen bermakna di kelas dalam $< 15$ detik.
* **Entry Conditions:** Selalu tersedia di sudut kanan bawah layar pada seluruh tab *Teacher Home*.
* **User Intent:** "Anak sedang membuat karya balok unik; saya ingin memotret dan menandainya sekarang tanpa meninggalkan anak."
* **Allowed Actions:** Ketuk satu kali untuk membuka `EvidenceCaptureSheet`.
* **Acceptance Criteria (Verification Gates):**
  - [ ] Terbuka instan dalam waktu $< 150\text{ms}$ tanpa *layout shifting*.

---

### CC-07: `EvidenceCaptureSheet`
* **Purpose:** Lembar modal tangkap cepat bukti autentik (Foto, Catatan Anekdot, Tag Dimensi, Target Siswa).
* **Data Required:** Daftar siswa rombel aktif, daftar tag Capaian Pembelajaran Kurikulum Merdeka PAUD.
* **Allowed Actions:**
  - Ambil foto kamera langsung atau unggah dari galeri.
  - Pilih satu anak (Kenzo) atau multi-anak (bila aktivitas kelompok).
  - Pilih 1–3 *Quick Tags* (cth: `STEAM_BLOCKS`, `SELF_IDENTITY`, `LITERACY`).
  - Ketuk "Simpan Cepat" (Progressive Capture: teks narasi panjang bersifat opsional).
* **Forbidden Actions:** Memaksa guru mengisi formulir 10 isian saat kelas sedang aktif.
* **Command Invoked:** `captureQuickObservationCommand(schoolId, classId, studentIds[], mediaPayload, tags)`.
* **Governance Boundary:** Draf tersimpan dengan status `is_staff_confidential = true` secara default (Aman dari kebocoran).
* **Acceptance Criteria (Verification Gates):**
  - [ ] Waktu interaksi total dari tombol ditekan hingga draf tersimpan $< 15$ detik.
  - [ ] Foto terkompresi otomatis di sisi klien sebelum diunggah ke *storage bucket*.

---

### CC-08: `ObservationFeed`
* **Purpose:** Menampilkan lini masa kronologis momen belajar dan hasil karya rombel hari ini.
* **Allowed Actions:** Melihat kartu momen; membuka laci pengayaan narasi; menyalakan toggle *Bagikan ke Orang Tua*.
* **Acceptance Criteria (Verification Gates):**
  - [ ] Menyajikan inisial guru pencatat (cth: `ST` untuk Bu Siti, `MR` untuk Bu Maria) sebagai jejak kolaborasi.

---

## 5. Child Context & Synthesis Components (Tab 3: Siswa & Rapor)

### CC-09: `ChildContextPivotModal`
* **Purpose:** Menampilkan rekam jejak holistik satu anak (*One Child Context Pivot*) saat guru mengetuk profil siswa.
* **Data Required:** Profil anak, rekap kehadiran semester, linimasa portofolio karya, riwayat LPPA.
* **Allowed Actions:**
  - Meninjau 100% karya ananda sepanjang semester.
  - Menambahkan observasi khusus yang otomatis terkunci pada ananda tersebut (*Zero child selector*).
  - Membuka draf refleksi rapor LPPA ananda.
* **Forbidden Actions:** Membuka tab atau dialog baru yang menghilangkan konteks kelas induk.
* **Acceptance Criteria (Verification Gates):**
  - [ ] Seluruh aksi yang dilakukan di dalam modal secara mutlak mewarisi `student_id` ananda terpilih.

---

### CC-10: `EnrichmentTrayDrawer` (Laci Pengayaan Fase 8)
* **Purpose:** Area kerja guru pada jam tenang (Fase 8 Sintesis Siang) untuk memperkaya narasi pedagogis dari draf pagi.
* **Entry Conditions:** Dibuka melalui tombol "Perkaya Momen Hari Ini" di Tab Belajar atau Tab Siswa.
* **User Intent:** "Saya ingin menyusun refleksi pedagogis dari 4 foto karya balok yang saya ambil tadi pagi."
* **Allowed Actions:**
  - Memperluas catatan singkat menjadi narasi observasi bermutu.
  - Menandai centang: `[☑ Jadikan Bukti Portofolio Rapor LPPA]`.
  - Menyalakan toggle: `[☑ Bagikan ke Buku Penghubung Keluarga]`.
  - Menekan tombol "Selesai & Arsipkan Bukti".
* **Command Invoked:** `enrichObservationNarrativeCommand(observationId, narrative, isPortfolio, isShared)`.
* **Governance Boundary:** Menghormati batasan semester `CLOSED`; pembaruan data mengalir ke agregasi LPPA.
* **Acceptance Criteria (Verification Gates):**
  - [ ] Status draf berubah menjadi `MATURE_EVIDENCE`.
  - [ ] Indikator tugas harian guru di `DailyCompletionSummary` terupdate secara *real-time*.

---

### CC-11: `GovernedShareControl`
* **Purpose:** Sakelar kendali izin publikasi bukti/momen ke orang tua murid.
* **Allowed Actions:** Guru menyalakan toggle `is_shared_with_guardian` dengan penegasan pratinjau.
* **Governance Boundary:** Terkunci ketat pada *C-11 Family Confidentiality*; dilarang membagikan observasi berlabel rahasia staf.
* **Acceptance Criteria (Verification Gates):**
  - [ ] Memberikan konfirmasi visual jelas: "Momen ini akan tampil pada aplikasi orang tua Kenzo."

---

## 6. System State, Diagnostics & Collaboration Components

### CC-12: `DailyCompletionSummary`
* **Purpose:** Ringkasan rekonsiliasi tugas harian guru di akhir hari sekolah.
* **Data Required:** Status presensi (100% tuntas?), status draf momen (Semua terkayakan?), status pesan ortu.
* **Visual Presentation:** Indikator perayaan lembut: *"Semua tugas kelas TK A hari ini selesai dengan baik! Siap menyambut hari esok."*
* **Acceptance Criteria (Verification Gates):**
  - [ ] Memberikan rasa tenang (*peace of mind*) pada guru sebelum meninggalkan sekolah.

---

### CC-13: `OfflineSyncStateIndicator`
* **Purpose:** Memberikan kepastian status koneksi data dan antrian sinkronisasi lokal.
* **Visual States:**
  - 🟢 **Online:** "Tersinkronisasi ke Cloud."
  - 🟡 **Offline Buffer:** "3 Perubahan Tersimpan di Perangkat (Akan sinkron saat online)."
  - 🔵 **Syncing:** "Menyinkronkan data..."
* **Acceptance Criteria (Verification Gates):**
  - [ ] Guru tetap dapat melakukan presensi dan mengambil foto saat koneksi internet sekolah terputus total.

---

## 7. Stage 4.1 Application Command Contracts (TypeScript Typed Surface)

Seluruh komponen di atas berinteraksi dengan *Application Service Layer* melalui kontrak perintah terketik:

```typescript
export interface RecordDailyAttendanceBatchCommand {
  school_id: string;
  class_id: string;
  attendance_date: string; // YYYY-MM-DD
  entries: Array<{
    student_id: string;
    status: 'PRESENT' | 'SICK' | 'PERMIT' | 'ABSENT';
    arrival_time?: string;
    temperature_celsius?: number;
    arrival_mood?: 'HAPPY' | 'CALM' | 'ANXIOUS' | 'TIRED';
    notes?: string;
  }>;
}

export interface CaptureQuickObservationCommand {
  school_id: string;
  class_id: string;
  target_student_ids: string[]; // 1 or more children
  media_attachment_url?: string;
  quick_tags: string[]; // e.g. ['STEAM_BLOCKS', 'SELF_IDENTITY']
  initial_note?: string;
  recorded_by_person_id: string;
}

export interface EnrichObservationNarrativeCommand {
  observation_id: string;
  pedagogical_narrative: string;
  curriculum_dimensions: string[];
  is_lppa_evidence: boolean;
  is_shared_with_guardian: boolean;
  is_staff_confidential: boolean;
}

export interface AcknowledgeGuardianNoticeCommand {
  notice_id: string;
  acknowledged_by_person_id: string;
  teacher_reply_text?: string;
}
```

---

## 8. Summary & Architecture Gate Sign-Off

```text
╔════════════════════════════════════════════════════════════════════════════════════╗
║             STAGE 4.1 TEACHER HOME INTERACTION COMPONENT CONTRACT                  ║
║                                                                                    ║
│  CC-01: TeacherHomeShell                           🟢 SPECIFIED & BOUNDED          │
│  CC-02: ClassroomPulseBanner                       🟢 SPECIFIED & BOUNDED          │
│  CC-03: OperatingStateIndicator                    🟢 SPECIFIED & BOUNDED          │
│  CC-04: AttendanceGrid & ChildCard                 🟢 SPECIFIED & BOUNDED          │
│  CC-05: GuardianNoticeLedger                       🟢 SPECIFIED & BOUNDED          │
│  CC-06: QuickCaptureFloatingButton                 🟢 SPECIFIED & BOUNDED          │
│  CC-07: EvidenceCaptureSheet                       🟢 SPECIFIED & BOUNDED          │
│  CC-08: ObservationFeed                            🟢 SPECIFIED & BOUNDED          │
│  CC-09: ChildContextPivotModal                     🟢 SPECIFIED & BOUNDED          │
│  CC-10: EnrichmentTrayDrawer                       🟢 SPECIFIED & BOUNDED          │
│  CC-11: GovernedShareControl                       🟢 SPECIFIED & BOUNDED          │
│  CC-12: DailyCompletionSummary                     🟢 SPECIFIED & BOUNDED          │
│  CC-13: OfflineSyncStateIndicator                  🟢 SPECIFIED & BOUNDED          │
│                                                                                    │
│  Type-Safe Application Command Contracts           🟢 DECLARED                     │
│  Stage 3 Governance Invariants (I-01..I-10)        🔒 PRESERVED & ENFORCED         │
│  Human Workflow Invariants (HWI-01..HWI-05)        🛡️ ENFORCED                     │
║                                                                                    ║
╚════════════════════════════════════════════════════════════════════════════════════╝
```

---

**Certified by:**  
*Yapendik School OS Component Architecture Board*  
`2026-08-26 • Jakarta, Indonesia`
