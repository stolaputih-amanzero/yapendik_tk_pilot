# ADR-UX-012: Slide-Up Chevron Navigation & Hub-and-Spoke Architecture

## STATUS: RATIFIED (2026-09-01)

* **Governing Tier:** LEVEL 1 — ARCHITECTURAL DECISION RECORD (CONSTITUTIONAL AMENDMENT)
* **Preceding ADRs:** `ADR-UX-001` (MD3 Window Size Classes), `ADR-UX-005` (Padma Modern), `ADR-UX-011` (Amanaura OS Flow Consolidation)
* **Ratification Authority:** Architecture Review Board (ARB) & Project Owner
* **Enforcement Scope:** Mobile COMPACT (`< 600px`) Navigation Topology, Floating Button Offsets, Hub Screen Ergonomics

---

## 1. Context & Problem Statement

Pada spesifikasi `ADR-UX-001` dan `ADR-UX-011`, navigasi mobile pada breakpoint `COMPACT (< 600px)` mengandalkan **Mobile Omni-Bar Capsule** (*"Apa fokus Anda hari ini?"*) bertumpuk dengan *Smart Chips Carousel*.

Evaluasi operasional lapangan pada konteks Pendidik TK (*Stage 4.1 Teacher Home*) mengidentifikasi sejumlah kelemahan struktural:

1. **Vertical Footprint Clutter**: Kapsul pencarian mengambang dan carousel memakan $\pm 64\text{–}80\text{px}$ tinggi viewport ponsel yang sangat berharga.
2. **FAB Collision & Safe-Area Drift**: Tombol Momen Cepat (FAB ✦) terpaksa didorong ke ketinggian ekstrem `+96px` dari bawah agar tidak bertabrakan dengan Omni-Bar, mempersempit area baca linimasa presensi dan ritme kelas.
3. **Cognitive Mismatch with Pedagogical Workflow**: Guru TK di kelas mendampingi anak secara taktil dan membutuhkan akses langsung 1-ketuk (*1-Tap Contextual Flow*). Model command search menambah friksi navigasi (*layer of abstraction*).

---

## 2. Decision: Hub-and-Spoke Topology & Slide-Up Chevron Menu

ARB dan Project Owner meratifikasi transformasi arsitektural resmi:

### 2.1 Hub-and-Spoke Architecture

* **Beranda Kelas / Beranda Role adalah Hub Utama**:
  * Seluruh aktivitas harian mengalir secara linier dan kontekstual di dalam **Zona 2 Linimasa**.
  * Aksi primer dapat diakses secara langsung (1-tap) melalui kartu ritme dan tombol aksi in-page (`Rencana Main →`, `Presensi →`, `Gema Hangat →`).
* **Sub-Halaman adalah Spokes**:
  * Setiap perpindahan ke modul detail (*Buku Penghubung*, *Studio LPPA*, *Roster Siswa*) memiliki tombol kembali hierarkis (`← Kembali ke Beranda`) yang deterministik (**G-10**).

### 2.2 "Horizon Handle" — Hairline + Chevron Tengah Tanpa Teks (Collapsed State)

* Menghilangkan seluruh teks label ("Menu") dari handle bawah. Affordance visual chevron telah berbicara sendiri secara elegan.
* **Anatomi Visual**:
  * Hairline 1px (`line-soft`) full-bleed melintasi layar dari kiri ke kanan yang terputus ±24px di bagian tengah.
  * Menempatkan ikon Lucide `ChevronUp` resmi (`w-5 h-5`, `text-ink-faint`) persis di celah tengah (larangan karakter mentah `⌃` per Law 11 / **G-3**).
* **Zona Sentuh & Gestur**:
  * Strip tak terlihat full-width dengan tinggi `calc(env(safe-area-inset-bottom, 0px) + 48px)` memenuhi standar MD3 $\ge 48\text{dp}$ (`min-h-[48px]`).
  * Tap pada chevron atau swipe-up pada strip langsung membuka sheet "MENU NAVIGASI" (**Amanaura Spring** `{380,32,0.8}`, `max-h-[90dvh]`).
  * Aksesibilitas: `role="button"`, `aria-label="Buka Menu Navigasi"`, focus-visible Luminescent Edge, dan *coachmark* sopan 1× (localStorage).

### 2.3 Curated "MENU NAVIGASI" Sheet (Expanded State)

* Membuka sheet modal taktil dengan parameter:
  * **Grab Handle & Pinning**: Grab bar *brass* di bagian atas, tombol tutup `✕` tersemat rapi.
  * **Search Bar**: Input *"Cari modul atau menu..."* di puncak sheet (**G-2**).
  * **Grid 4 × 2 Squircle Flat**: 8 modul utama per peran dengan label Kamus Pendidik $\le 2$ kata dan badge notifikasi angka nyata (*brass counter* / **G-5**).
  * **Fisika Gerak**: Animasi *Amanaura Spring* `{ stiffness: 380, damping: 32, mass: 0.8 }` (R-PHYSICS / **G-4**).
  * **Dimensi & Aksesibilitas**: `max-h-[90dvh]`, *focus trap*, listener tombol `Esc`, dan gestur *swipe-down to dismiss*.

### 2.4 Purnabakti FAB (Law of Single Primary Presence)

* Tombol mengambang duplikat (*QuickCaptureFloatingButton*) dipurnabaktikan secara penuh dari seluruh tata letak dan rute guru.
* **Jalur Akses Rekam Momen Tetap Lengkap**:
  1. **Inline Contextual CTA**: Pada Beranda Kelas, linimasa sirkadian menyediakan aksi inline `Rekam Momen →` pada fase yang relevan (Fase 4: Kegiatan Inti & Bermain Terpimpin).
  2. **Nav-Sheet Tile**: Pada seluruh rute, sheet "MENU NAVIGASI" menyediakan tile `Momen Belajar` (2-tap) yang memicu modal rekam momen secara instan.
* **Tepi Bawah Murni**: Tepi bawah layar kini sepenuhnya menjadi milik **Horizon Handle** tanpa elemen mengambang tambahan (**G-6**).

### 2.5 Relokasi PWA Soft Install Chip

* Install Smart Chip yang sebelumnya menumpang pada Omni-Bar direlokasi secara permanen ke dalam **Profile & Settings Drawer** serta panduan instalasi iOS di TopBar (**§8.1.2 amendment**).

### 2.6 Doktrin Invisible Scroll (Invisible Mastery #8)

* Menghilangkan scrollbar native browser dari seluruh permukaan tampilan (`scrollbar-width: none`, `::-webkit-scrollbar { width: 0; height: 0; }`).
* Membebaskan kanvas dari garis rel vertikal tepi kanan sehingga seluruh antarmuka menyatu alami dengan kanvas (*The OS Disappears into the Day*).

---

## 3. Pagar Ratifikasi Mengikat (Ratification Guardrails G-1 s.d. G-10)

| ID | Klausul Pagar | Status Penegakan |
| --- | --- | --- |
| **G-1** | **One-Tap Hub Invariant**: Hub mempertahankan Briefing CTA + $\le 2$ quick-chip di Zona 1; linimasa vertikal mengalir kontekstual di Zona 2. | Ditegakkan di `TeacherHomeShell.tsx` & `TeacherCircadianTimeline.tsx` |
| **G-2** | **Pinnacle Search Field**: Input pencarian modul wajib hadir di puncak sheet "MENU NAVIGASI". | Ditegakkan di `MobileOmniBar.tsx` |
| **G-3** | **Icon & Touch Target Law**: Ikon wajib Lucide `ChevronUp` di tengah hairline, hit-area $\ge 48\text{dp}$, `aria-label="Buka Menu Navigasi"`, ZERO text noise. | Ditegakkan di `MobileOmniBar.tsx` |
| **G-4** | **Sheet Ergonomics & Physics**: Patuh §7.9, Amanaura Spring `{380,32,0.8}`, `max-h-[90dvh]`, focus-trap, Esc. | Ditegakkan di `MobileOmniBar.tsx` |
| **G-5** | **Tile Semantics & Flat Fluid**: Label $\le 2$ kata dari `routeRegistry`, badge brass hanya untuk counter riil, flat hairline tanpa shadow berat. | Ditegakkan di `MobileOmniBar.tsx` |
| **G-6** | **Law of Single Primary Presence**: FAB capture dipurnabaktikan; allowlist FAB kosong di seluruh rute guru. | Ditegakkan di `TeacherHomeShell.tsx` & `amanaura-audit.mjs` |
| **G-7** | **Desktop Invariant**: Size class `MEDIUM` (Mini-Rail `72px`) dan `EXPANDED` (Sidebar `256px` + Linimasa Vertikal) tetap tidak berubah. | Ditegakkan di `TopBar.tsx`, `Sidebar.tsx` |
| **G-8** | **Document & SSOT Sync**: Ratifikasi ADR-UX-012, patch §3.4 & §5.4 master docs, changelog entry. | Ditegakkan di docs |
| **G-9** | **CI Guard Hardening**: Check `min-h-[48px]` chevron, aturan `R-HORIZON-PURE`, `R-INVISIBLE-SCROLL`, `R-FAB-ALLOWLIST`. | Ditegakkan di `amanaura-audit.mjs` |
| **G-10** | **Hierarchical Determinism**: Sub-modul wajib menyediakan alur kembali deterministik ke Beranda Hub. | Ditegakkan di sub-surfaces |

---

## 4. Redrawn MD3 Navigation Topology (§3.1 Addendum)

```text
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                              AMANAURA v3.0 MD3 NAVIGATION TOPOLOGY (ADR-UX-012)                          │
│                                                                                                          │
│  COMPACT (< 600px)             MEDIUM (600px - 839px)            EXPANDED (≥ 840px)                      │
│  ┌───────────────────────┐     ┌───────────────────────┐         ┌───────────────────────────────┐       │
│  │ [TopBar: Logo + User] │     │ [TopBar: Brand + User]│         │ [TopBar: Brand + School + User]│      │
│  ├───────────────────────┤     ├──────┬────────────────┤         ├───────────┬───────────────────┤       │
│  │                       │     │[Mini]│                │         │ [Sidebar] │ [Workspace Area]  │       │
│  │ [Hub-and-Spoke        │     │[Rail]│ [Workspace]    │         │ (w-64 or  │ (p-6 Centered)    │       │
│  │  Beranda Linimasa]    │     │[w-72]│ [max-w-lg]     │         │  w-18     │                   │       │
│  │                       │     │[Icons]│                │         │  Slide)   │                   │       │
│  │                       │     │      │                │         │           │                   │       │
│  │ ─────── ∧ ─────────── │     │      │                │         │           │                   │       │
│  │     Horizon Handle    │     └──────┴────────────────┘         └───────────┴───────────────────┘       │
│  └───────────────────────┘     (Navigation Rail 72px)            (Full Collapsible Sidebar)              │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Addendum II: Reklasifikasi Konten Ritme vs Chrome Pagination (§5.1.2)

* **Chrome Pagination (Dilenyapkan)**: Mekanisme paging visual seperti scrollbar native, Soft Load More Pill, dan Floating Position HUD dilenyapkan untuk membebaskan ruang dan menjaga estetika kanvas.
* **Konten Ritme (Kanonikal & Dipertahankan)**: `TeacherCircadianTimeline` (linimasa ritme sirkadian 8 fase PAUD) dan `WarmEchoCarousel` (Gema Hangat) adalah *cermin hari guru* yang sarat makna pedagogis dan afirmasi emosional. Keduanya bukan mekanisme paging, melainkan konten kanonikal yang wajib tampil utuh.

---

## 6. Addendum III: Law of Single Primary Presence & Purnabakti FAB

* **Doktrin Inti**: *"Aksi mengambang (FAB) hanya boleh eksis bila TIDAK ADA aksi inline setara di viewport yang sama."*
* **Implementasi**: Komponen `QuickCaptureFloatingButton` resmi dipensiunkan dari seluruh workspace guru. Tepi bawah layar kini sepenuhnya murni menjadi milik Horizon Handle (satu garis, satu chevron, nol teks). CI Guard memberlakukan `R-FAB-ALLOWLIST` (allowlist kosong).

---

## 7. Addendum IV: Magnetic Horizon Handle v2 (Magnetic Swipe Affordance)

* **Evolusi Bentuk**: Horizon Handle ditingkatkan dari garis statis sederhana menjadi **Magnetic Horizon Handle** yang menggoda sentuhan (*tempting magnetic affordance*) tanpa kembali menjadi Omni-Bar berat atau menambahkan teks label.
* **Karakteristik & Anatomi Kanonikal**:
  1. **Split Hairline**: Garis horizontal `bg-line-soft` terputus di tengah (`left-0 right-[calc(50%+28px)]` dan `left-[calc(50%+28px)] right-0`), menciptakan ceruk magnetik visual.
  2. **Center Chevron Cluster**: Ikon Lucide `ChevronUp` resmi (`w-5 h-5`) dalam kapsul lingkaran halus `w-8 h-8` dengan hit area sentuh $\ge 48\text{dp}$ (`min-h-[56px]`).
  3. **Soft Golden Glow**: Radial warm gold aura di belakang chevron (`bg-accent-valor/15 blur-xl w-12 h-6`) tanpa bayangan berat atau elevasi FAB.
  4. **Micro-Lift Animation**: Animasi bernapas naik 2–3px lalu turun perlahan setiap 3 detik (`animate-horizon-lift`), otomatis berhenti pada mode *reduced motion* (`motion-reduce:animate-none`).
  5. **Magnetic Swipe Affordance**: Area handle menerima gestur swipe-up vertikal ($\ge 24\text{px}$) untuk membuka lembar "MENU NAVIGASI" secara intuitif.
  6. **Polite 1× Coachmark**: Petunjuk geser satu-kali untuk pengguna baru (`"Geser ke atas untuk menu"`), otomatis hilang setelah 3 detik dan tersimpan di `localStorage`.
  7. **Zero Permanent Text**: Menjaga konstitusi nol teks "Menu" permanen pada collapsed dock.

---

## 8. Addendum V: Horizon Handle v3 & v3.1 — The Dawn Aura (Cahaya Fajar)

* **Diagnosa & Filosofi**: Mengatasi kegagalan perseptual kontras di *Midnight Sanctuary* (di mana chevron pudar dan glow kecil tenggelam di layar OLED) dengan mengangkat konsep **"The Dawn Aura"** — horizon yang menyingsing di mana satu-satunya titik hangat di tepi bawah adalah chevron emas di atas kolam cahaya fajar.
* **Anatomi Kanonikal (v3 & v3.1)**:
  1. **Chevron Emas & Perunggu**: Ikon resmi Lucide `ChevronUp` `w-5 h-5` (`strokeWidth={2.5}`) dengan warna tema ganda: `text-valor-deep` (oklch 0.55 perunggu dalam di *Ivory Canvas*) dan `dark:text-accent-valor` (oklch 0.80 emas terang di *Midnight Sanctuary*).
  2. **Dawn Glow Pool**: Kolam pendaran cahaya radial `w-24 h-10 rounded-full blur-lg bg-accent-valor/28 dark:bg-accent-valor/25` di belakang chevron.
  3. **Gradient Horizon Line**: Dua hairline memakai `bg-gradient-to-r from-transparent via-line-strong dark:via-line-soft to-valor-deep/60 dark:to-accent-valor/40`.
  4. **Breathing Sync (`amanaura-horizon-breathe`)**: Sinkronisasi napas halus antara translasi chevron (`translateY -3px`) dan kenaikan opasitas glow (`0.6 → 1`) dalam siklus harmonis 3.2s.
  5. **First-Visit Bloom (`amanaura-horizon-bloom`)**: Pada kunjungan pertama sesi baru, pendaran mekar (`scale 0.85 → 1.15`, lift `-6px`, 900ms).

---

## 9. Addendum VI: Horizon Handle v4 — The Peeking Horizon (Gerbang Fajar)

* **Diagnosa & Terobosan**: Glow adalah affordance mode gelap (*cahaya di kegelapan*). Pada kanvas terang, affordance terbaik datang dari **kontras dan kedalaman bentuk fisik**. Rahasia affordance swipe-up terbaik adalah memperlihatkan sedikit bibir laci yang akan ditarik (*the sheet lip preview*).
* **Anatomi Kanonikal v4**:
  1. **Horizon Notch (Bibir Sheet)**: Elemen `w-20 h-9 rounded-t-2xl bg-brand dark:bg-surface-subtle border-t border-x border-line-soft/50 dark:border-line/60` menempel (*flush*) di tepi bawah. Di Ivory Canvas, warna navy pekat (`bg-brand`) memberikan kontras visual mutlak ($\approx 12:1$) yang langsung mengunci fokus jempol.
  2. **Chevron Emas Universal**: Ikon Lucide `ChevronUp` resmi (`w-5 h-5`, `strokeWidth={2.5}`) dalam balutan warna `text-accent-valor` (emas Amanaura) di kedua tema — terbaca dengan kontras $\approx 8:1$ di atas navy dan $\approx 5:1$ di atas elevated night.
  3. **Warm Sky Canopy**: Kanopi fajar `h-14 bg-gradient-to-t from-valor-deep/25 via-accent-valor/10 to-transparent dark:from-accent-valor/20 dark:via-accent-valor/8` membentang di atas garis horizon.
  4. **Split Hairline Horizon**: Garis gradien kiri/kanan (`to-valor-deep/60` di light, `to-accent-valor/40` di dark) menyala masuk ke arah notch.
  5. **Magnetic Press Responsif**: Saat disentuh (`onTouchStart` / `onPointerDown`), notch terangkat sedikit (`-translate-y-1 scale-105`) dan kanopi langit menguat ke opasitas penuh.
  6. **Micro-Lift Breathing**: Chevron bernapas halus `-3px` dalam ritme sirkadian 3.2s (`animate-horizon-breathe`), otomatis statis saat `prefers-reduced-motion`.
  7. **Konstitusional Zero Floating FAB**: Notch menempel (*flush*) di tepi bawah kanvas tanpa `shadow-floating` atau efek melayang, mempertahankan kepatuhan penuh terhadap `R-FAB-ALLOWLIST` dan `R-HORIZON-PURE`.

---

## 10. Addendum VII: Sheet & Profile Hygiene — 3-Col Wrap & Role-Aware Curation

* **Amandemen Guardrail G-2 (No Search di COMPACT Sheet)**:
  * Pembukaan keyboard virtual pada form input pencarian di perangkat bergerak menyebabkan oklusi (menutupi daftar menu navigasi di bawahnya). Sesuai prinsip *Calm & Dignified*, search bar dihilangkan dari lembar COMPACT (pencarian global dialokasikan ke TopBar EXPANDED dengan keyboard fisik).
* **Grid Kanonikal 3-Kolom & Anti-Truncation (Supersedes 4×2 Squircle)**:
  * Grid modul dialihkan ke format `grid-cols-3 gap-3` (maksimum 3 per baris).
  * Label modul menghapus `truncate` dan menerapkan `text-center text-xs leading-snug break-words` sehingga seluruh nama modul ditampilkan utuh (misal: "Buku Penghubung" melipat ke dua baris tanpa elipsis).
* **Role-Aware Curation (Pembersihan Dev-Tools dari Chrome Guru)**:
  * Modul diagnostik pengembang (*Living Contract & Token Specimen*, *Uji Otorisasi TESTS*, dan status *SHA/Cloud Sync*) ditarik dari permukaan guru di `MobileOmniBar` dan `ProfileDrawer`.
  * Rute pengembangan tetap hidup dan dapat diakses langsung via URL (`#percontohan`, `#uji-otorisasi`).

---

## 11. Addendum VIII: Single-Surface Launcher — 3×3 Grid & Utility Footer

* **Doktrin Tiles = Destinasi, Rows = Tindakan**:
  * Elemen grid dialokasikan murni untuk destinasi navigasi ruang kerja.
  * Tile ke-9 **Profil** (`CircleUser`) ditambahkan melengkapi grid menjadi format **3×3 sempurna** (8 modul utama + Profil), menghilangkan rongga asimetris.
  * Tapping tile Profil membuka `ProfileDrawer` yang kini direduksi murni menjadi **Kartu Identitas Pengguna** (avatar, nama, role, unit sekolah).
* **Utility Footer (Tindakan & Pengaturan Cepat)**:
  * Di bawah grid 3×3 disematkan footer utilitas terstruktur:
    1. **Tema Visual (Segmented Control Inline)**: Toggle `[Ivory | Midnight]` satu ketukan langsung tanpa membuka modal terpisah.
    2. **Pasang Aplikasi (PWA / iOS Guide)**: Ditampilkan secara kondisional bila aplikasi belum terpasang.
    3. **Keluar dari Sesi**: Diposisikan paling bawah dengan *danger tint* (`bg-danger-tint border-danger-line text-danger`) untuk mencegah ketidaksengajaan sentuhan.
* **Single Control Point 432Hz Audio Gate**:
  * Kontrol denting harmonis 432Hz dipusatkan secara eksklusif pada kartu beranda ritual harian pendidik, menghilangkan redundansi di Profile Drawer.

---
*Disahkan secara konstitusional oleh Architecture Review Board (ARB) pada 1 September 2026.*
