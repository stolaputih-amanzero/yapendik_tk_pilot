# Yapendik School OS — UI/UX Design Foundation v1.0
**Document ID:** `DOC-UI-UX-DESIGN-FOUNDATION-v1.0`  
**Status:** `LIVING — ACTIVE DESIGN GOVERNANCE`  
**Date:** `2026-08-26`  
**Target Scope:** `Yapendik School OS (TK Pilot Baseline & Future Cross-Domain Horizon)`  
**Baseline Anchor:** `Stage 4.1 Certified Implementation Baseline (119/119 Tests Passed)`

---

## 1. Executive Summary & Purpose

Dokumen ini menetapkan **UI/UX Design Foundation v1.0** untuk *Yapendik School OS*. 

Design Foundation ini bukan sekadar *style guide* statis atau katalog komponen visual yang berlebihan (*over-engineered enterprise UI library*), melainkan sebuah **Living Design Baseline & Governance Layer** yang mengunci bahasa visual, ergonomi interaksi, hierarki tipografi, ritme spasial, serta standar aksesibilitas di seluruh permukaan sistem operasi sekolah.

### Prinsip Utama: *“Design the system, not the screen.”*
Pondasi ini diekstraksi langsung dari implementasi nyata **Stage 4.1 Teacher Daily Operating Loop (Unified Teacher Home)** yang telah tersertifikasi (*certified baseline*). Fondasi ini memastikan bahwa saat sistem berkembang ke **Stage 4.2 (LPPA Synthesis & Reporting Engine)**, **Stage 4.3 (Parent Portal)**, **Stage 5.0 (Foundation Multi-Unit Operations)**, hingga jenjang SD/SMP/SMA, seluruh antarmuka terasa sebagai **satu produk yang utuh, tenang, bermartabat, dan berakar pada pedagogi nyata**, tanpa memperlambat kecepatan rekayasa perangkat lunak.

---

## 2. Architectural Constraints & Non-Negotiable Guardrails

Pekerjaan desain antarmuka dan interaksi **WAJIB** tunduk pada 5 batas arsitektural mutlak (*System Invariants*):

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        5 ARCHITECTURAL DESIGN CONSTRAINTS                              │
├────────────────────────────────┬───────────────────────────────────────────────────────┤
│ 1. No Component Owns Governance│ Logika tata kelola (aturan promosi, kunci semester,   │
│                                │ batas hak akses) berada di domain & DB, BUKAN di UI.  │
├────────────────────────────────┼───────────────────────────────────────────────────────┤
│ 2. No Component Owns Database  │ Komponen UI tidak mengeksekusi mutasi SQL langsung.   │
│                                │ UI hanya memanggil Application Command & Service.     │
├────────────────────────────────┼───────────────────────────────────────────────────────┤
│ 3. Typed Application Commands  │ Semua mutasi data WAJIB melalui Command DTO ber-tipe  │
│                                │ ketat dengan client-side UUID v4 deterministik.       │
├────────────────────────────────┼───────────────────────────────────────────────────────┤
│ 4. Preserve Stage 3 Substrate  │ Proteksi semester tutup (`trg_closed_period_guard`),  │
│                                │ fail-closed RLS, dan audit trail tidak boleh diabaikan│
├────────────────────────────────┼───────────────────────────────────────────────────────┤
│ 5. Invariant C-11 Privacy Guard│ Mutual exclusivity mutlak antara data rahasia staf    │
│                                │ (`is_staff_confidential`) vs dibagikan ke orang tua.  │
└────────────────────────────────┴───────────────────────────────────────────────────────┘
```

---

## SECTION 1 — DESIGN PHILOSOPHY

Bahasa visual dan interaksi *Yapendik School OS* dirancang untuk mencerminkan nilai-nilai pendidikan Kristen yang ramah, tertib, dan berorientasi pada perkembangan anak.

### 1.1 Pilar Filosofi UX
1. **Calm & Dignified (Ketenangan & Martabat)**:
   - Hindari warna neon tajam, *gamification* berlebihan (*confetti/streaks* yang tidak mendidik), dan animasi bising. Antarmuka harus memberikan rasa aman, tenang, dan tertata bagi pendidik yang seharian bekerja dalam dinamika anak usia dini.
2. **Pedagogical Clarity (Kejelasan Pedagogis)**:
   - Guru tidak boleh dibebani dengan istilah teknis basis data. Istilah yang tampil adalah bahasa nyata sekolah: *"Sambut Ananda"*, *"Sentra Main & Eksplorasi"*, *"Momen Cepat"*, *"Sintesis Siang"*, dan *"Buku Penghubung"*.
3. **The OS Disappears into the Day (Sistem yang Mengalir Alami)**:
   - Target kognitif guru saat membuka aplikasi adalah:
     > **"Saya tahu persis apa yang harus saya perhatikan dan lakukan saat ini."**  
     *Bukan:* "Saya harus mempelajari cara kerja aplikasi ini dulu."
4. **Mobile-First & Tactile Ergonomics (Ergonomi Taktil Bergerak)**:
   - Guru TK sering berinteraksi dengan ponsel atau tablet sambil berdiri, mendampingi sentra balok, atau menyambut anak di pagar sekolah. Aksi utama harus dapat diselesaikan dalam **1-tap** dengan *touch target* yang nyaman.

---

## SECTION 2 — DESIGN TOKEN FOUNDATION

Design Token didefinisikan secara semantik untuk menjembatani desain dan kode sumber melalui variabel CSS / Tailwind CSS v4.

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        YAPENDIK SEMANTIC TOKEN HIERARCHY                               │
│                                                                                        │
│  PRIMITIVE VALUES               SEMANTIC TOKENS               COMPONENT BINDINGS       │
│  (Raw Hex / Palette)            (Intent / Meaning)            (UI Elements)            │
│  • slate-900 (#0f172a)   ───►   • text-primary         ───►   • Student Card Title     │
│  • indigo-600 (#4f46e5)  ───►   • brand-accent         ───►   • Active Tab Button      │
│  • amber-500 (#f59e0b)   ───►   • capture-quick        ───►   • [⚡ Momen Cepat] FAB    │
│  • emerald-600 (#16a34a) ───►   • status-complete      ───►   • All-Clear Banner Badge │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### 2.1 Color Tokens (Semantic Palette)

Berdasarkan audit Stage 4.1, palet warna distandardisasi menjadi token fungsional:

| Semantic Token | Nilai Baseline Tailwind | Deskripsi & Penggunaan Kanonikal |
|:---|:---|:---|
| `color-bg-canvas` | `bg-slate-100/70` | Latar belakang seluruh halaman aplikasi. |
| `color-surface-card` | `bg-white` | Latar permukaan kartu, form, dan panel utama. |
| `color-surface-subtle` | `bg-slate-50` | Latar selang-seling, input container, drawer form background. |
| `color-surface-inset` | `bg-slate-900` | Latar TopBar institusional, Dark Ribbon konteks sekolah. |
| `color-text-primary` | `text-slate-900` | Teks judul utama, nama siswa, label field aktif (kontras tinggi). |
| `color-text-secondary` | `text-slate-600` | Subtitle, deskripsi bantuan, timestamp sekunder. |
| `color-text-muted` | `text-slate-400` | Placeholder, divider label, teks non-aktif. |
| `color-text-inverse` | `text-white` | Teks di atas latar gelap atau tombol primer. |
| `color-brand-primary` | `bg-indigo-600` / `text-indigo-700` | Aksi primer, tab aktif, navigasi utama, fokus sistem. |
| `color-brand-accent` | `bg-amber-500` / `text-amber-900` | Momen Cepat, indikator draf kilat, peringatan suhu/alergi. |
| `color-status-success`| `bg-emerald-100` / `text-emerald-900` | Presensi Hadir, status Matang, verifikasi All-Clear. |
| `color-status-warning`| `bg-amber-100` / `text-amber-900` | Presensi Sakit, draf belum diperkaya, perhatian pagi. |
| `color-status-danger` | `bg-rose-100` / `text-rose-900` | Presensi Alpa, error mutasi, indikator jaringan offline. |
| `color-status-info`   | `bg-sky-100` / `text-sky-900` | Presensi Izin, pengumuman kelas, portal wali murid. |
| `color-lppa-evidence` | `bg-purple-100` / `text-purple-900`| Kurasi portofolio & bukti capaian rapor LPPA. |
| `color-border-default`| `border-slate-200` | Garis batas standar kartu dan seksi antarmuka. |
| `color-border-strong` | `border-slate-300` | Garis batas input form dan tombol sekunder. |

### 2.2 Typography Tokens

Standar tipografi Yapendik OS mengutamakan **keterbacaan instan (*legibility & scannability*)** daripada gaya dekoratif:

| Token Name | Scale / Weight | Size / Leading | Penggunaan Kanonikal |
|:---|:---|:---|:---|
| `font-display` | Inter / Bold 800 | `24px (1.5rem)` / `1.25` | Judul Workspace Utama (*Teacher Home*). |
| `font-h1` | Inter / Black 900 | `18px (1.125rem)` / `1.3` | Judul Seksi Utama (*Presensi & Kedatangan*). |
| `font-h2` | Inter / Extrabold 800 | `14px (0.875rem)` / `1.35` | Judul Kartu Siswa, Header Drawer Pengayaan. |
| `font-h3` | Inter / Bold 700 | `13px (0.8125rem)` / `1.4` | Sub-seksi, Nama Siswa di Roster. |
| `font-body` | Inter / Normal 400 | `13px (0.8125rem)` / `1.5` | Narasi anekdot observasi, teks pengumuman. |
| `font-body-bold`| Inter / Semibold 600 | `13px (0.8125rem)` / `1.5` | Poin penting, status terverifikasi. |
| `font-caption` | Inter / Medium 500 | `11px (0.6875rem)` / `1.4` | Timestamp, nama pencatat, petunjuk aksi. |
| `font-mono-data` | JetBrains Mono / Bold | `11px (0.6875rem)` / `1.2` | NIS, NPSN, kode kelas, temperature °C. |

### 2.3 Spacing Scale (8-Point Modular Grid)

| Token | Ukuran Piksel | Tailwind Class | Penggunaan Standar |
|:---|:---|:---|:---|
| `space-3xs` | `2px` | `p-0.5`, `gap-0.5` | Jarak antar tag chip mini, status dot. |
| `space-2xs` | `4px` | `p-1`, `gap-1` | Padding internal badge, chip selection. |
| `space-xs` | `8px` | `p-2`, `gap-2` | Jarak antar tombol aksi sebaris, micro-stack. |
| `space-sm` | `12px` | `p-3`, `gap-3` | Padding dalam kartu ringkas, form row gap. |
| `space-md` | `16px` | `p-4`, `gap-4` | Padding standar kartu (*ChildCard*, *PulseBanner*). |
| `space-lg` | `24px` | `p-6`, `gap-6` | Padding modal/drawer, jarak antar seksi surface. |
| `space-xl` | `32px` | `p-8`, `gap-8` | Padding dashboard desktop, container boundary. |
| `space-2xl`| `48px` | `py-12` | Empty state container, auth splash screen. |

### 2.4 Border Radius Tokens

| Token | Radius | Tailwind Class | Penggunaan Standar |
|:---|:---|:---|:---|
| `radius-xs` | `4px` | `rounded` | Kode mono, NIS badge, badge kecil. |
| `radius-sm` | `8px` | `rounded-lg` | Chip filter, rating indicator button. |
| `radius-md` | `12px` | `rounded-xl` | Tombol aksi standar, input field textarea. |
| `radius-lg` | `16px` | `rounded-2xl` | Kartu siswa (*ChildCard*), feed item, pulse alert. |
| `radius-xl` | `24px` | `rounded-3xl` | Modal dialog, drawer container, sheet overlay. |
| `radius-pill`| `9999px`| `rounded-full` | Floating Action Button (FAB), avatar initial dot. |

### 2.5 Shadow & Elevation Tokens

| Token | Elevation | Nilai Shadow | Penggunaan Standar |
|:---|:---|:---|:---|
| `shadow-none` | 0dp | `none` | Inset ribbon, flat chip inaktif. |
| `shadow-subtle` | 1dp | `shadow-xs` / `shadow-sm` | Kartu siswa default, form input focus state. |
| `shadow-card` | 2dp | `shadow-md` | Kartu aktif, card hover effect. |
| `shadow-popover`| 4dp | `shadow-xl` | Dropdown menu konteks, persona switcher menu. |
| `shadow-floating`| 8dp | `shadow-2xl shadow-amber-500/30` | Tombol melayang `[⚡ Momen Cepat]`, Modal dialog. |

### 2.6 Motion & Transition Tokens

| Token | Durasi & Kurva | Penggunaan Standar |
|:---|:---|:---|
| `motion-tactile` | `150ms ease-out` | Respon klik tombol presensi, mood chip, toggle. |
| `motion-drawer` | `300ms cubic-bezier(0.16, 1, 0.3, 1)` | Slide-in drawer pengayaan dari kanan layar. |
| `motion-modal` | `200ms ease-out` | Fade & scale-up modal sheet pivot satu anak. |
| `motion-reduced`| `0ms` (Instan) | Menghormati pengaturan OS `@media (prefers-reduced-motion)`. |

---

## SECTION 3 — RESPONSIVE FOUNDATION

Yapendik School OS menganut pendekatan **Mobile-First & Mobile-Optimized Desktop**:

```text
┌─────────────────┬─────────────────┬──────────────────┬───────────────────┐
│ MOBILE (< 640px)│ TABLET (≥ 640px)│ LAPTOP (≥ 1024px)│ DESKTOP (≥ 1280px)│
├─────────────────┼─────────────────┼──────────────────┼───────────────────┤
│ 1 Kolom Vertikal│ 2 Kolom Grid    │ 3 Kolom Grid     │ 3-4 Kolom Grid    │
│ Bottom Sheet /  │ Centered Modal  │ Slide Drawer /   │ Fixed Master      │
│ Full-width Form │ / Wide Drawer   │ Multi-Pane View  │ Work Surfaces     │
│ Fixed Bottom FAB│ Floating Corner │ Floating Corner  │ Floating Corner   │
└─────────────────┴─────────────────┴──────────────────┴───────────────────┘
```

### 3.1 Perilaku Responsif Komponen Kunci
1. **Roster Kartu Siswa (*AttendanceGrid*)**:
   - *Mobile*: 1 kolom kartu per baris, tombol presensi 4 kolom horizontal selebar kartu.
   - *Tablet*: 2 kolom grid dengan *mood selector* terlihat langsung.
   - *Desktop*: 3 kolom grid terstruktur dengan *longitudinal indicators*.
2. **Laci Pengayaan (*EnrichmentTrayDrawer*)**:
   - *Mobile*: Mengisi 100% lebar layar dari bawah (*Bottom Sheet Drawer*).
   - *Desktop*: Slide-over panel dari sisi kanan dengan lebar tetap `max-w-lg (512px)`.
3. **Modal Pivot Konteks Satu Anak (*ChildContextPivotModal*)**:
   - *Mobile*: Tampilan layar penuh dengan *sticky tab header*.
   - *Desktop*: Dialog terpusat `max-w-2xl` dengan *backdrop blur*.

---

## SECTION 4 — TOUCH & INTERACTION FOUNDATION

### 4.1 Aturan Target Sentuh Minimum (Touch Targets)
- **Minimum Tap Area**: `44px x 44px` (Standar WCAG 2.5.5) untuk seluruh tombol utama di perangkat sentuh.
- **Visual Hitbox**: Komponen visual boleh berukuran `36px` asalkan padding klik transparan memenuhi minimal `44px`.

### 4.2 Pola Interaksi Kanonikal (Tactile Interaction Patterns)

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        CANONICAL INTERACTION PATTERNS                                  │
├────────────────────────────────┬───────────────────────────────────────────────────────┤
│ 1. 1-Tap Attendance Toggle     │ Klik langsung mengubah status (Hadir/Sakit/Izin/Alpa) │
│                                │ tanpa membuka dropdown atau modal konfirmasi tambahan.│
├────────────────────────────────┼───────────────────────────────────────────────────────┤
│ 2. 1-Tap Arrival Mood Pill     │ 4 pilihan ekspresi emosi (😊 Ceria, 😌 Tenang,        │
│                                │ 😟 Gelisah, 😢 Sedih) langsung tersimpan deterministik│
├────────────────────────────────┼───────────────────────────────────────────────────────┤
│ 3. Fast Capture Gesture        │ Tombol mengambang [⚡ Momen Cepat] selalu dapat diakses │
│                                │ dari posisi jempol kanan bawah atau tombol hotkey.    │
├────────────────────────────────┼───────────────────────────────────────────────────────┤
│ 4. Inline Narrative Enrichment │ Tombol [Perkaya Narasi] langsung membuka laci pengayaan│
│                                │ tanpa meninggalkan halaman atau kehilangan konteks.  │
└────────────────────────────────┴───────────────────────────────────────────────────────┘
```

---

## SECTION 5 — COMPONENT FOUNDATION

Fondasi komponen Yapendik OS mengunci kumpulan **primitif kanonikal** tanpa komponen *redundant*:

### 5.1 Katalog Primitif Kanonikal
1. **Layout & Shell**:
   - `AppShell`: Pembungkus terluar dengan `TopBar` institusional dan `ContextRibbon`.
   - `SurfaceContainer`: Kontainer permukaan kerja dengan pembatas lebar maksimal (`max-w-7xl`).
   - `SectionHeader`: Header seksi dengan judul tebal, ikon semantik, dan status count pill.
2. **Data Presentation**:
   - `ClassroomPulseBanner`: Ringkasan kehadiran kelas, peringatan alergi/suhu medis, dan hitungan draf.
   - `ChildCard`: Kartu identitas anak terpadu (Presensi 1-tap, Mood kedatangan, Tag alergi, Aksi cepat).
   - `ObservationTimelineItem`: Kartu momen belajar dalam linimasa dengan inisial guru dan status kematangan.
3. **Input & Capture**:
   - `QuickCaptureFAB`: Tombol aksi melayang `[⚡ Momen Cepat]` dengan shortcut `Ctrl+K`.
   - `EvidenceCaptureSheet`: Form cepat tangkap momen (<15 dtk) dengan multi-selector anak dan tag PAUD.
   - `EnrichmentTrayDrawer`: Laci refleksi siang dengan pilihan rating (BB/MB/BSH/BSB) dan Invariant C-11.
4. **Context & Deep Dive**:
   - `ChildContextPivotModal`: Modal pivot riwayat komprehensif satu anak (Portofolio, Presensi, Kesehatan, Rapor).
   - `GuardianNoticeLedger`: Linimasa komunikasi dua arah dengan thread konfirmasi dan balasan orang tua.
5. **System Feedback & Connectivity**:
   - `DailyCompletionSummary`: Kartu ringkasan penutupan hari kerja ("All Clear Reconciliation").
   - `OfflineSyncStateIndicator`: Indikator real-time status online/offline dan antrian drain lokal.

---

## SECTION 6 — INFORMATION HIERARCHY

Untuk mencegah masalah umum *"Everything is a card and everything is important"*, tata letak setiap layar mengikuti aturan visual 8 level hierarki:

```text
LEVEL 1: IDENTITAS PERMUKAAN (Surface Identity)
         └── "Teacher Home — Kelompok A (Bintang Ceria)"

LEVEL 2: KONTEKS INSTITUSIONAL (Stable Context)
         └── Unit Sekolah • Tahun Ajaran • Semester Ganjil • Nama Pendidik

LEVEL 3: DENYUT KELAS & KESELAMATAN (Classroom Pulse & Health Exceptions)
         └── Kehadiran 100% • ⚠️ Kenzo (Alergi Debu) • ⚠️ Gabriel (Alergi Seafood)

LEVEL 4: RITME PEDAGOGIS SAAT INI (Active Operating State)
         └── "⏰ 07:15: Sambut Ananda — Cek presensi, suhu, dan ekspresi kedatangan"

LEVEL 5: TUGAS OPERASIONAL UTAMA (Primary Action Surface)
         └── Roster Presensi Anak (1-tap Hadir/Sakit/Izin/Alpa + Mood Ceria/Tenang)

LEVEL 6: DRAF & DUKUNGAN PEMBELAJARAN (Workflows in Progress)
         └── Kegiatan Main Hari Ini (RPPH) • Linimasa Momen Cepat Perlu Diperkaya

LEVEL 7: KOMUNIKASI & BUKU PENGHUBUNG (Two-Way Collaboration)
         └── Catatan Wali Murid & Pengumuman Kelas Terkonfirmasi

LEVEL 8: STATUS REKONSILIASI PENUTUPAN HARI (Reconciliation Status)
         └── "✨ Semua presensi terekam • 0 draf tertunda • Siap sintesis siang"
```

---

## SECTION 7 — CONTEXTUAL UX

Konteks operasional Yapendik OS berprinsip: **"Visible, Stable, and Trustworthy."**

1. **Zero-Dropdown Redundancy**:
   Pendidik yang bertugas di kelasnya tidak boleh memilih sekolah, tahun ajaran, semester, atau nama kelas secara berulang-ulang di setiap form input.
2. **Context Anchoring**:
   Seluruh aksi mutasi secara otomatis menyematkan `school_id`, `class_id`, `academic_year_id`, `recorded_by_person_id`, dan `client_generated_uuid` dari *Security Context Provider*.
3. **Visual Context Feedback**:
   - *Context Ribbon* berwarna gelap di bawah header selalu menampilkan informasi sekolah aktif dan persona aktif secara transparan.

---

## SECTION 8 — STATE DESIGN SYSTEM

Setiap komponen UI wajib memiliki visualisasi konsisten untuk 15 status kanonikal:

```text
┌──────────────────┬─────────────────────────────────┬──────────────────────────────────┐
│ STATUS           │ VISUAL INDICATOR                │ PENGGUNAAN                       │
├──────────────────┼─────────────────────────────────┼──────────────────────────────────┤
│ 1. Loading       │ Spinner indigo / Pulse Skeleton │ Menunggu query agregat selesai   │
│ 2. Empty         │ Dashed container + Action CTA   │ Belum ada observasi hari ini     │
│ 3. Active        │ Solid brand bg + Contrast text  │ Tab aktif, tombol terpilih       │
│ 4. Inactive      │ Transparent bg + Muted text     │ Tab santai, opsi sekunder        │
│ 5. Success       │ Emerald pill + CheckCircle      │ Presensi Hadir, data tersinkron  │
│ 6. Warning       │ Amber pill + AlertTriangle      │ Suhu demam, anak sakit           │
│ 7. Danger        │ Rose pill + AlertCircle         │ Presensi Alpa, error validasi    │
│ 8. Info          │ Sky pill + Info icon            │ Izin orang tua, panduan kurikulum│
│ 9. Quick Draft   │ Amber border + Sparkles icon    │ Momen cepat belum diperkaya      │
│ 10. Mature Evid. │ Emerald border + CheckCircle    │ Observasi selesai diperkaya siang│
│ 11. LPPA Flagged │ Purple badge + Award icon       │ Bukti sah portofolio rapor akhir │
│ 12. Confidential │ Amber Lock icon                 │ Catatan internal pendidik & KS   │
│ 13. Shared Parent│ Teal Share2 icon                │ Dibagikan ke portal wali murid   │
│ 14. Online Sync  │ Emerald Wifi badge              │ Terhubung ke server Supabase     │
│ 15. Offline Queued│ Rose WifiOff badge (Pulse)      │ Bekerja offline, antrian aman    │
└──────────────────┴─────────────────────────────────┴──────────────────────────────────┘
```

---

## SECTION 9 — DATA DENSITY BY PERSONA

Yapendik OS membedakan kepadatan data (*data density*) berdasarkan peran pengguna:

1. **Teacher Persona (Kepadatan Taktil - Medium/Spacious)**:
   - Kartu besar, tombol 1-tap luas, fokus pada aksi cepat di kelas, pemisahan visual yang lega agar tidak salah sentuh.
2. **Guardian Persona (Kepadatan Naratif - Human/Warm)**:
   - Tampilan linimasa foto karya anak, narasi perkembangan yang hangat, bahasa komunikatif tanpa kode teknis.
3. **Headmaster & Foundation Superadmin (Kepadatan Analitik - Compact/Data-Dense)**:
   - Baris tabel ringkas, metrik kapasitas persentase, visualisasi telemetri lintas unit sekolah.

---

## SECTION 10 — ACCESSIBILITY FOUNDATION (A11Y)

1. **Rasio Kontras Keterbacaan**:
   - Teks utama (`text-slate-900` di atas `bg-white` / `bg-slate-100`) memiliki rasio kontras $\ge 12:1$ (jauh melampaui standar WCAG AAA $7:1$).
   - Teks sekunder (`text-slate-600`) memiliki rasio kontras $\ge 4.5:1$ (WCAG AA).
2. **Non-Color Dependent Indicators**:
   - Status presensi tidak hanya mengandalkan warna hijau/merah, melainkan selalu menyertakan label teks eksplisit (`HADIR`, `SAKIT`, `IZIN`, `ALPA`) dan ikon status.
3. **Focus States & Keyboard Ergonomics**:
   - Seluruh elemen interaktif memiliki `focus:ring-2 focus:ring-indigo-500`.
   - Shortcut global `Ctrl+K` langsung membuka sheet Momen Cepat.

---

## SECTION 11 — ICONOGRAPHY STANDARDS

- **Icon Set**: `lucide-react` (Kanonikal).
- **Style**: Stroke icon konsisten (`stroke-width: 1.75px` s.d. `2px`).
- **Sizing Scale**:
  - `w-3 h-3` / `w-3.5 h-3.5` (Micro): Di dalam chip kecil, inline timestamp, tag.
  - `w-4 h-4` / `w-5 h-5` (Standard): Di tombol aksi, list item icon, tab navigation.
  - `w-6 h-6` s.d. `w-8 h-8` (Hero/Empty): Di header seksi, empty state container.
- **Rule of Labeling**: Ikon aksi utama tidak boleh berdiri sendiri (*icon-only*) pada tampilan ponsel; **WAJIB** menyertakan teks label pendamping.

---

## SECTION 12 — COMPONENT NAMING & CODE CONVENTIONS

Struktur kode antarmuka mengikuti konvensi repositori yang ada:

```text
src/
├── components/
│   ├── layout/               # Shell institusional & navigasi utama (TopBar, ContextRibbon)
│   ├── workspaces/           # Workspace domain operasional
│   │   ├── teacher/          # Stage 4.1 Teacher Daily Operating Surface (Kanonikal)
│   │   │   ├── TeacherHomeShell.tsx
│   │   │   ├── TodaySurface.tsx
│   │   │   ├── LearningSurface.tsx
│   │   │   ├── StudentRosterSurface.tsx
│   │   │   ├── ChildCard.tsx
│   │   │   ├── AttendanceGrid.tsx
│   │   │   ├── OperatingStateIndicator.tsx
│   │   │   ├── ClassroomPulseBanner.tsx
│   │   │   ├── EvidenceCaptureSheet.tsx
│   │   │   ├── EnrichmentTrayDrawer.tsx
│   │   │   ├── ChildContextPivotModal.tsx
│   │   │   ├── GuardianNoticeLedger.tsx
│   │   │   ├── DailyCompletionSummary.tsx
│   │   │   ├── ObservationFeed.tsx
│   │   │   ├── OfflineSyncStateIndicator.tsx
│   │   │   └── QuickCaptureFloatingButton.tsx
│   │   └── ...               # Standalone legacy & governance dashboards
```

### Konvensi Penamaan Props
- `on[ActionName]` (e.g. `onSaveCapture`, `onOpenEnrichment`, `onToggleActivityComplete`).
- `is[StateName]` (e.g. `isSaving`, `isOpen`, `isAttendanceComplete`).
- `[entityName]Id` (e.g. `studentId`, `observationId`, `schoolId`).

---

## SECTION 13 — TAILWIND CSS IMPLEMENTATION STRATEGY

Menggunakan **Tailwind CSS v4** dengan `@import "tailwindcss";` dan pemetaan token semantik tanpa framework styling eksternal yang berat.

### Aturan Dark Variant Isolation
Untuk mencegah kebocoran media query OS mode gelap ke kontainer terang, isolasi varian dark mode dikunci pada [`src/index.css`](file:///d:/PROJECT/yapendik-tk-pilot/src/index.css):

```css
@import "tailwindcss";

/* Scoped dark variant: hanya aktif saat selector .dark disematkan secara eksplisit */
@custom-variant dark (&:where(.dark, .dark *));
```

---

## SECTION 14 — DESIGN TOKEN FILE STRUCTURE (RECOMMENDED ROADMAP)

Struktur file token yang direkomendasikan untuk evolusi Stage 4.2+ (non-disruptif):

```text
src/
├── styles/
│   ├── tokens.css            # Variabel CSS semantik (--color-bg-canvas, --radius-lg)
│   └── typography.css        # Kelas tipografi standar (.text-heading-1, .text-data-mono)
```

---

## SECTION 15 — STAGE 4.1 DESIGN AUDIT

Audit keselarasan antara implementasi Stage 4.1 dan Design Foundation:

| Area / Komponen | Evaluasi Implementasi Stage 4.1 | Klasifikasi | Catatan Evaluasi |
|:---|:---|:---:|:---|
| **Typography Contrast** | Judul `text-slate-900 font-black`, Subtitle `text-indigo-700`, Roster `text-slate-900`. | ✅ **Aligned** | Sangat tajam, kontras tinggi, zero leakage. |
| **Allergy Filtering** | Nilai "Tidak ada" difilter defensif di banner Perhatian Pagi dan ChildCard. | ✅ **Aligned** | Bebas *false positive alert*. |
| **1-Tap Attendance** | Tombol Hadir/Sakit/Izin/Alpa + Mood pill di *ChildCard*. | ✅ **Aligned** | Ergonomis, cepat, dan terbukti di browser UAT. |
| **Fast Capture Primitive** | Tombol [⚡ Momen Cepat] melayang di kanan bawah + modal capture <15 dtk. | ✅ **Aligned** | HWI-03 terpenuhi penuh. |
| **Invariant C-11 Guard** | Laci pengayaan memisahkan secara tegas radio `SHARED` vs `CONFIDENTIAL`. | ✅ **Aligned** | Terverifikasi di test suite & browser. |
| **Offline Sync Queue** | Indikator `OfflineSyncStateIndicator` menampilkan status jaringan dan auto-drain. | ✅ **Aligned** | Transparan dan tidak mengganggu alur guru. |
| **Legacy Modul Placement**| Modul lama dipindahkan rapi ke dropdown *"Lainnya (Standalone Legacy)"*. | ✅ **Aligned** | Mempertahankan *backward compatibility*. |
| **Shared Utility Extraction**| Variabel kelas styling saat ini berupa Tailwind utility eksplisit di komponen. | 🟡 **Minor Adj.** | Dapat diekstrak ke semantic CSS tokens pada Stage 4.2. |

---

## SECTION 16 — DESIGN DEBT REGISTER

| ID | Isu Desain / Konsistensi | Komponen Terdampak | Tingkat Keparahan | Rekomendasi Mitigasi | Target Milestone |
|:---|:---|:---|:---:|:---|:---:|
| **DD-01** | Inline Tailwind classes panjang pada modal dan button primitif. | `EvidenceCaptureSheet`, `EnrichmentTrayDrawer` | Rendah (Low) | Ekstraksi ke reusable UI primitives saat refactor bertahap. | Stage 4.2 |
| **DD-02** | Icon Lucide dipanggil langsung per komponen tanpa centralized icon dictionary. | Seluruh komponen workspace | Rendah (Low) | Buat file barrel/mapping icon standar untuk School OS. | Stage 4.3 |
| **DD-03** | Penyesuaian tema warna sekolah kustom (Multi-school branding customization). | `TopBar`, `TeacherHomeShell` | Rendah (Low) | Bind `--color-brand-primary` ke database profile unit sekolah. | Stage 5.0 |

---

## SECTION 17 — GOVERNANCE & EVOLUTION MODEL

Status dokumen ini adalah **LIVING — ACTIVE DESIGN GOVERNANCE**. Dokumen ini berevolusi secara teratur seiring bertambahnya domain baru Yapendik OS.

### Matriks Otoritas Perubahan Desain
1. **Tier 1 — Free Evolution (Dapat Berubah Bebas)**:
   - Penyesuaian mikro-spacing, penambahan variasi icon baru, perbaikan teks label instruksi.
2. **Tier 2 — Design Review Required (Perlu Review Desain)**:
   - Penambahan komponen primitif baru, perubahan skala warna semantik, penambahan breakpoint responsif.
3. **Tier 3 — Architecture & Governance Approval Required (Wajib Review Arsitektur)**:
   - Perubahan yang menyentuh Invariant C-11, perubahan alur 8 Operating States, perubahan alur Command mutasi data.

---

## SECTION 18 — ADOPTION ROADMAP

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        DESIGN FOUNDATION ADOPTION ROADMAP                              │
├────────────────────────────────┬───────────────────────────────────────────────────────┤
│ STAGE 4.1 (Current Certified)  │ Unified Teacher Home & Daily Operating Loop reference.│
│                                │ Status: BASELINE ANCHOR TERKUNCI ✅                   │
├────────────────────────────────┼───────────────────────────────────────────────────────┤
│ STAGE 4.2 (Next Milestone)     │ LPPA Synthesis & Reporting Engine UI.                  │
│                                │ Menerapkan token tipografi naratif & kurasi portofolio│
├────────────────────────────────┼───────────────────────────────────────────────────────┤
│ STAGE 4.3 (Future)             │ Parent Portal (Portal Wali Murid).                    │
│                                │ Menerapkan token narasi ramah keluarga & buku hubung. │
├────────────────────────────────┼───────────────────────────────────────────────────────┤
│ STAGE 5.0 (Foundation Horizon) │ Multi-Unit School Governance & Analytics Dashboard.   │
│                                │ Menerapkan token data-dense & telemetri yayasan.      │
└────────────────────────────────┴───────────────────────────────────────────────────────┘
```

---

## 3. Kesimpulan & Status Akhir

> **Pernyataan Sertifikasi:**  
> **Yapendik School OS UI/UX Design Foundation v1.0** resmi disahkan sebagai *Living Baseline Governance Layer*. Seluruh ekspansi modul pada Stage 4.2 dan seterusnya wajib mengacu pada standar ergonomi, token semantik, dan hierarki informasi yang tercantum dalam dokumen ini.
