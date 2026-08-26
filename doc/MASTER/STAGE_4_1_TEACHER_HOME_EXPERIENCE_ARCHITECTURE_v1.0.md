# Yapendik School OS — Stage 4.1 Teacher Home Experience Architecture v1.0
**Document ID:** `DOC-STAGE-4-1-EXPERIENCE-ARCH-v1.0`  
**Status:** `ACTIVE ARCHITECTURE SPECIFICATION — UX BASELINE`  
**Date:** `2026-08-26`  
**Target Milestone:** `Domain 4.1 Unified Teacher Home Experience & Surface Architecture`  
**Parent Specifications:**  
- `DOC-STAGE-4-1-TEACHER-DAILY-OPERATING-MODEL-v1.0`  
- `DOC-STAGE-4-1-INTERACTION-SPEC-v1.0`  
**Governance Substrate:** `Stage 3 Frozen Baseline (DOC-STAGE-3-CLOSURE-CERT-v1.0)`

---

## 1. Executive Charter & North-Star Experience Anchor

### 🌟 The Core Experience Question
> **"Ketika guru membuka School OS, apa sebenarnya yang harus hadir di hadapannya — dan apa yang sengaja TIDAK BOLEH ada?"**

```text
┌───────────────────────────────────────────────────────────────────────────────────┐
│                      WHAT MUST BE PRESENT vs WHAT MUST BE ABSENT                  │
├───────────────────────────────────────────────────────────────────────────────────┤
│                                                                                   │
│  ✅ YANG HARUS HADIR:                                                             │
│  • Detak Jantung Kelas Hari Ini (Denyut Kehadiran & Status Anak Saat Ini).        │
│  • Intensi Mengajar Aktif (Fokus Pengalaman Main Hari Ini / RPPH Ringkas).        │
│  • Tombol Primitif "Momen Cepat" (Akses instan capture foto/anekdot < 15 detik).  │
│  • Peringatan Eksepsi Kritis (Alergi, catatan khusus orang tua, anak sakit).      │
│  • Kejelasan Tugas Hari Ini ("Apa yang masih membutuhkan sentuhan saya hari ini?").│
│                                                                                   │
│  ❌ YANG SENGAJA TIDAK BOLEH ADA:                                                 │
│  • Dropdown pemilihan bertingkat (Sekolah ➔ TA ➔ Semester ➔ Rombel).              │
│  • Formulir administratif panjang berkoma-koma saat jam kelas aktif.              │
│  • Grafik KPI rumit & statistik analitik multi-tahun yang membebani kognitif.     │
│  • Tombol duplikasi fitur yang memaksa guru berpikir "harus buka modul apa".      │
│                                                                                   │
└───────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Information Hierarchy (Hierarki Informasi Permukaan Guru)

Antarmuka *Teacher Home* disusun dalam 3 tingkat hierarki visual yang ketat:

```text
┌───────────────────────────────────────────────────────────────────────────────────┐
│ TIER 1: THE ACTIVE CLASSROOM PULSE (Status Detak Kelas Saat Ini)                  │
│ • Nama Rombel & Jumlah Anak Hadir (cth: "Kelompok TK A • 15/16 Anak Hadir")       │
│ • Banner Eksepsi Hari Ini (cth: "1 Catatan Orang Tua: Kenzo Alergi Udang")        │
│ • Floating Action Primitive: [ ⚡ Momen Cepat ]                                   │
├───────────────────────────────────────────────────────────────────────────────────┤
│ TIER 2: PRIMARY OPERATING SURFACE (3 Tab Kanonikal Sesuai Ritme)                  │
│ ┌─────────────────────────┬─────────────────────────┬───────────────────────────┐ │
│ │ TAB 1: HARI INI         │ TAB 2: BELAJAR & KARYA  │ TAB 3: SISWA & RAPOR      │ │
│ │ • Presensi Cepat        │ • Rencana Main Hari Ini │ • Roster 16 Anak          │ │
│ │ • Cek Mood / Kedatangan │ • Feed Momen Kelas      │ • Rekam Jejak Portofolio  │ │
│ │ • Buku Penghubung Ortu  │ • Kurasi Bukti LPPA     │ • Draf Sintesis Rapor     │ │
│ └─────────────────────────┴─────────────────────────┴───────────────────────────┘ │
├───────────────────────────────────────────────────────────────────────────────────┤
│ TIER 3: PROGRESSIVE ENRICHMENT DRAWER (Terselubung Saat Sibuk, Hadir Saat Santai) │
│ • Laci pengayaan narasi pedagogis observasi (Fase 8 Sintesis Siang).              │
│ • Modal tinjauan detail satu anak (*One Child Context Pivot*).                    │
└───────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. State $\rightarrow$ Surface Mapping (Satu Permukaan yang Menyesuaikan Ritme)

*8 Operating States* dari ritme hari guru tidak dipecah menjadi 8 halaman statis, melainkan **mentransformasikan fokus permukaan *Teacher Home* secara kontekstual**:

```text
┌───────────────────────────┬───────────────────────────┬───────────────────────────┐
│ Operating State           │ Fokus Visual Permukaan    │ Tindakan Utama yang Muncul│
├───────────────────────────┼───────────────────────────┼───────────────────────────┤
│ **Fase 1: PREPARE**       │ Tab Hari Ini              │ Reviu catatan titipan     │
│ *(06:45 - 07:15)*         │ (Mode Kesiapan)           │ orang tua kemarin.        │
├───────────────────────────┼───────────────────────────┼───────────────────────────┤
│ **Fase 2: WELCOME**       │ Tab Hari Ini              │ Grid Kartu Anak interaktif│
│ *(07:15 - 07:45)*         │ (Grid Presensi Kedatangan)│ Tap 1x Hadir / Cek Suhu.  │
├───────────────────────────┼───────────────────────────┼───────────────────────────┤
│ **Fase 3: GATHER**        │ Tab Belajar & Karya       │ Kartu Intensi Main hari   │
│ *(07:45 - 08:30)*         │ (Intentional Plan Glance) │ ini (Tema Sentra Balok).  │
├───────────────────────────┼───────────────────────────┼───────────────────────────┤
│ **Fase 4: PLAY & OBSERVE**│ Backgrounded Mode         │ Primitif `[⚡ Momen Cepat]`│
│ *(08:30 - 10:00)*         │ (Layar Terkunci Ringkas)  │ Jepret foto karya anak.   │
├───────────────────────────┼───────────────────────────┼───────────────────────────┤
│ **Fase 5: CARE & BREAK**  │ Tab Hari Ini              │ Catatan insiden / toilet  │
│ *(10:00 - 10:30)*         │ (Log Harian Ringkas)      │ jika ada kejadian khusus. │
├───────────────────────────┼───────────────────────────┼───────────────────────────┤
│ **Fase 6: REFLECT**       │ Tab Belajar & Karya       │ Galeri cepat foto karya   │
│ *(10:30 - 11:00)*         │ (Koleksi Momen Hari Ini)  │ yang diambil tadi pagi.   │
├───────────────────────────┼───────────────────────────┼───────────────────────────┤
│ **Fase 7: HANDOVER**      │ Tab Hari Ini              │ Toggle share ke orang tua │
│ *(11:00 - 11:30)*         │ (Buku Penghubung Siap)    │ & konfirmasi penjemput.   │
├───────────────────────────┼───────────────────────────┼───────────────────────────┤
│ **Fase 8: SYNTHESIZE**    │ Tab Belajar / Tab Siswa   │ Drawer Pengayaan Narasi   │
│ *(11:30 - 13:00)*         │ (Review & Enrich Tray)    │ & centang Bukti LPPA.     │
└───────────────────────────┴───────────────────────────┴───────────────────────────┘
```

---

## 4. The `Momen Cepat` Interaction Primitive

`Momen Cepat` bukan sekadar tombol CRUD biasa, melainkan **primitif penangkapan fakta autentik kanonikal** yang dapat dipicu dari mana saja:

```text
                             [ ⚡ MOMEN CEPAT ]
                                     │
                                     ▼
        ┌─────────────────────────────────────────────────────────┐
        │ 1. MEDIA INPUT: Foto Kamera / Audio Suara / Teks Cepat  │
        │ 2. TARGET ANAK: 1 Anak (Kenzo) atau Multi-Anak          │
        │ 3. QUICK TAG: [Balok/STEAM] [Seni] [Kemandirian] [Sosial]│
        │ 4. DISPOSISI AWAL: Draf Cepat (Default Internal Staf)   │
        └─────────────────────────────────────────────────────────┘
                                     │
                                     ▼ (Simpan Instan < 15 detik)
                         [CANONICAL EVIDENCE ITEM]
                                     │
             ┌───────────────────────┴───────────────────────┐
             ▼                                               ▼
   [DISELESAIKAN LANGSUNG]                      [DIPERKAYA PADA FASE 8]
  (Jika guru punya waktu 1 menit)             (Laci draf siang hari)
```

---

## 5. One Child Context Navigation Model (Pivot Konteks Tunggal)

Ketika guru menyentuh profil seorang anak (misal: Kenzo), antarmuka **tidak berpindah halaman**, melainkan **memutar konteks (*Context Pivot*)** ke linimasa holistik anak tersebut:

```text
                   GURU MENGETUK KARTU "KENZO" PADA ROSTER
                                     │
                                     ▼
┌───────────────────────────────────────────────────────────────────────────────────┐
│ ONE CHILD VIEW: KENZO (NIS: 2026001 • KELAS TK A)                                 │
├───────────────────────────────────────────────────────────────────────────────────┤
│ • Status Hari Ini: HADIR (Suhu 36.5°C • Mood Ceria)                               │
│ • Linimasa Karya & Anekdot: 8 Evidence Terdaftar (3 dibagikan ke Pak Budi)        │
│ • Komunikasi Keluarga: Pesan titipan obat alergi terakhir terkonfirmasi dibaca.   │
│ • Status Sintesis LPPA: 3 Dimensi Capaian Pembelajaran terpenuhi bukti portofolio.│
├───────────────────────────────────────────────────────────────────────────────────┤
│ AKSI CEPAT DARI KONTEKS KENZO:                                                    │
│ [ 📸 Tambah Bukti Karya ]  [ 💬 Tulis Pesan Ortu ]  [ 📝 Perkaya Refleksi Rapor ] │
└───────────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Progressive Capture & The Phase 8 Enrichment Tray

Menerapkan **HWI-05 (*Capture Fast, Enrich Later*)**:

```text
PAGI (Fase 4 - Kelas Aktif):
  Kenzo + Foto Menara Balok + Tag [STEAM] ➔ Simpan Cepat.
                                │
                                ▼
SIANG (Fase 8 - Jam Tenang di Meja Guru):
  Guru membuka "Laci Pengayaan" (Enrichment Tray) ➔
  Muncul kartu foto balok Kenzo tadi pagi dengan status: [Perlu Pengayaan Narasi].
                                │
                                ▼
  Guru mengetik refleksi pedagogis:
  "Kenzo mampu mengidentifikasi titik tumpu dan menyusun 12 balok kayu simetris..."
  Centang: [ ☑ Jadikan Bukti Portofolio Rapor LPPA ]
  Toggle:  [ ☑ Bagikan Foto ke Buku Penghubung Pak Budi ]
                                │
                                ▼
  Status berubah menjadi: [ MATURE EVIDENCE & GOVERNED DISTRIBUTED ].
```

---

## 7. Exception States & Proactive System Diagnostics

```text
┌───────────────────────────────┬───────────────────────────────────────────────────┐
│ Skenario Eksepsi              │ Penyajian Visual pada Teacher Home                │
├───────────────────────────────┼───────────────────────────────────────────────────┤
│ **Anak Belum Presensi (08:30)**│ Kartu anak diberi border kuning halus dengan badge│
│                               │ "Belum Check-In" & tombol cepat [Hadir Terlambat].│
├───────────────────────────────┼───────────────────────────────────────────────────┤
│ **Catatan Penting dari Ortu** │ Banner oranye di puncak layar: "1 Pesan Baru:     │
│                               │ Orang tua Kenzo mengabarkan titip obat pukul 10." │
├───────────────────────────────┼───────────────────────────────────────────────────┤
│ **Koneksi Internet Offline**  │ Indikator pil hijau berubah abu-abu: "Tersimpan di│
│                               │ perangkat. Sinkronisasi otomatis saat online."    │
├───────────────────────────────┼───────────────────────────────────────────────────┤
│ **Semester Telah Tutup**      │ Banner informatif: "Semester Ganjil telah CLOSED. │
│ *(Stage 3 Invariant Guard)*   │ Seluruh pencatatan berada dalam mode Baca-Saja."  │
└───────────────────────────────┴───────────────────────────────────────────────────┘
```

---

## 8. Pemisahan Tegas: Stage 3 Governance Core vs Stage 4.1 Application Commands

Untuk mencegah asumsi API sembarangan, arsitektur memisahkan:

```text
STAGE 3 FROZEN GOVERNANCE SUBSTRATE
• Database Invariants (I-01 s.d. I-10)
• DDL Tables (student_placement_records, classes, academic_years)
• Triggers (trg_closed_period_guard, trg_placement_guard)
• RLS Context Isolation & Unique Deterministic Constraints
• 4 Mutating Lifecycle RPCs + 2 Derived Query Functions
                      ▲
                      │  (Mengonsumsi & Menghormati Kontrak)
                      │
STAGE 4.1 DOMAIN APPLICATION COMMANDS (BARU)
• recordDailyAttendanceBatchCommand(schoolId, classId, date, entries[])
• captureQuickObservationCommand(schoolId, classId, studentIds[], media, tags)
• enrichObservationNarrativeCommand(observationId, narrative, isPortfolio, isShared)
• acknowledgeGuardianNoticeCommand(noticeId, personId, replyText)
```

---

## 9. Summary & Architecture Gate Checklist

| Aspek Arsitektur | Evaluasi Kesiapan | Status |
|:---|:---|:---:|
| **Hierarki Informasi Permukaan** | 3 Tier (Pulse ➔ 3 Tab ➔ Enrichment Drawer) | 🟢 LOCKED |
| **Mapping 8 State ke 1 Permukaan** | Satu surface yang bertransformasi dinamis | 🟢 LOCKED |
| **Primitif Momen Cepat** | Mekanisme tangkap instan multi-media < 15 detik | 🟢 LOCKED |
| **One Child Context Pivot** | Pivot tanpa membuang konteks rombel | 🟢 LOCKED |
| **Progressive Enrichment Workflow** | Pemisahan jelas draf pagi vs pengayaan siang | 🟢 LOCKED |
| **Governed Distribution (C-11)** | Filter ketat pembagian ortu vs catatan rahasia | 🟢 LOCKED |
| **Konsumsi Stage 3 yang Sah** | Stage 4.1 commands mengonsumsi Stage 3 rules | 🟢 LOCKED |

---

**Certified by:**  
*Yapendik School OS Experience Architecture Board*  
`2026-08-26 • Jakarta, Indonesia`
