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

### 2.4 Amandemen Offset FAB (Floating Action Button)

* Tombol Momen Cepat (FAB ✦) direposisi di atas garis Horizon Handle:
  $$\text{Bottom Offset} = \text{env}(\text{safe-area-inset-bottom}, 0\text{px}) + 48\text{px}, \quad \text{Right} = 16\text{px} \ (\text{right-4})$$
* **Zero Collision**: Horizon handle menempati dasar layar, FAB mengambang bebas di kanan atas garis (**G-6**).

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
| **G-6** | **Zero Collision Spatial Offset**: FAB di kanan `+48px`, Horizon Handle di dasar `bottom-0`. Zero collision terbukti matematis. | Ditegakkan di `QuickCaptureFloatingButton.tsx` |
| **G-7** | **Desktop Invariant**: Size class `MEDIUM` (Mini-Rail `72px`) dan `EXPANDED` (Sidebar `256px` + Linimasa Vertikal) tetap tidak berubah. | Ditegakkan di `TopBar.tsx`, `Sidebar.tsx` |
| **G-8** | **Document & SSOT Sync**: Ratifikasi ADR-UX-012, patch §3.4 & §5.4 master docs, changelog entry. | Ditegakkan di docs |
| **G-9** | **CI Guard Hardening**: Check `min-h-[48px]` chevron, aturan `R-HORIZON-PURE`, `R-INVISIBLE-SCROLL`, kalibrasi Zero Overlay Collision. | Ditegakkan di `amanaura-audit.mjs` |
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
│  │             [✦ FAB]   │     │      │                │         │           │                   │       │
│  │        [ ⌃ Chevron ]  │     └──────┴────────────────┘         └───────────┴───────────────────┘       │
│  └───────────────────────┘     (Navigation Rail 72px)            (Full Collapsible Sidebar)              │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Addendum II: Reklasifikasi Konten Ritme vs Chrome Pagination (§5.1.2)

* **Chrome Pagination (Dilenyapkan)**: Mekanisme paging visual seperti scrollbar native, Soft Load More Pill, dan Floating Position HUD dilenyapkan untuk membebaskan ruang dan menjaga estetika kanvas.
* **Konten Ritme (Kanonikal & Dipertahankan)**: `TeacherCircadianTimeline` (linimasa ritme sirkadian 8 fase PAUD) dan `WarmEchoCarousel` (Gema Hangat) adalah *cermin hari guru* yang sarat makna pedagogis dan afirmasi emosional. Keduanya bukan mekanisme paging, melainkan konten kanonikal yang wajib tampil utuh.

---
*Disahkan secara konstitusional oleh Architecture Review Board (ARB) pada 1 September 2026.*
